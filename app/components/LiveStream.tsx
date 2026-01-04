
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Group, Comment } from '../types';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface LiveStreamProps {
  group: Group;
  onExit: () => void;
}

const LiveStream: React.FC<LiveStreamProps> = ({ group, onExit }) => {
  const { user } = useAuth();
  const { aiModel } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const personaIndexRef = useRef(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState<string[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewerCount] = useState(Math.floor(Math.random() * 100) + 40);
  const [userMessage, setUserMessage] = useState("");

  const startTimeRef = useRef<number>(Date.now());

  // Setup Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1080 },
            height: { ideal: 1920 }
          },
          audio: true
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        startTimeRef.current = Date.now(); // Mark start time
        setIsLive(true);
      } catch (err) {
        console.error("Camera error:", err);
        alert("Camera and Mic access are required for the network to see you.");
        onExit();
      }
    }
    setupCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onExit]);

  // Setup Speech Recognition
  useEffect(() => {
    if (!isLive) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let shouldRestart = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Handle final transcript - Post to chat
      if (finalTranscript) {
        const finalText = finalTranscript.trim();
        if (finalText) {
          setTranscriptBuffer(prev => [...prev, finalText]);

          // Post user message to chat immediately
          const msg: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            personaId: 'user',
            name: 'You',
            avatar: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
            text: finalText,
            timestamp: Date.now()
          };
          setComments(prev => [...prev, msg].slice(-50));
        }
      }

      // Handle long interim (approx 2 lines)
      if (interimTranscript.length > 150) {
        // Force commit the interim
        const msg: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          personaId: 'user',
          name: 'You',
          avatar: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
          text: interimTranscript.trim(),
          timestamp: Date.now()
        };
        setComments(prev => [...prev, msg].slice(-50));
        setTranscriptBuffer(prev => [...prev, interimTranscript.trim()]);
      }

      setCurrentSubtitle(interimTranscript);
    };

    recognition.onerror = () => { shouldRestart = true; };
    recognition.onend = () => { if (shouldRestart && isLive) recognition.start(); };

    try {
      recognition.start();
    } catch (e) { }

    recognitionRef.current = recognition;
    return () => {
      shouldRestart = false;
      recognition.stop();
    };
  }, [isLive, user]);

  // Handle user message (Manual)
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    const msg: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      personaId: 'user',
      name: 'You',
      avatar: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
      text: userMessage.trim(),
      timestamp: Date.now()
    };
    setComments(prev => [...prev, msg].slice(-50));
    setTranscriptBuffer(prev => [...prev, userMessage.trim()]); // Add manual text to buffer context
    setUserMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Process 10-second chunk
  const processBroadcastChunk = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !isLive) return;

    setIsProcessing(true);

    // Capture Image
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    // Get Transcription (Recent user inputs)
    // We use the transcriptBuffer which collects both speech and manual inputs
    const currentTranscript = transcriptBuffer.join(' ');
    setTranscriptBuffer([]); // Clear buffer after sending to AI

    // Pick Persona (cycling through)
    const persona = group.personas[personaIndexRef.current % group.personas.length];
    personaIndexRef.current++;

    try {
      const commentText = await geminiService.generatePersonaComment(
        persona,
        base64Image,
        currentTranscript,
        comments,
        aiModel
      );

      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        personaId: persona.id,
        name: persona.name,
        avatar: persona.avatar,
        text: commentText,
        timestamp: Date.now()
      };

      setComments(prev => [...prev, newComment].slice(-50));
    } catch (err) {
      console.error("Analysis cycle error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [group.personas, transcriptBuffer, comments, isProcessing, isLive, aiModel]);

  useEffect(() => {
    // Run every 10 seconds as requested
    const interval = setInterval(processBroadcastChunk, 10000);
    const initial = setTimeout(processBroadcastChunk, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, [processBroadcastChunk]);

  // Handle Stream End and Save
  const handleEndStream = async () => {
    if (!user) {
      onExit();
      return;
    }

    try {
      // Import dynamically to avoid circular deps if any, or just standard import usage
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);

      const sessionData = {
        userId: user.uid,
        title: `${group.name} Session`,
        description: `Live broadcast with ${group.name} community.`,
        startTime: Timestamp.fromMillis(startTimeRef.current),
        endTime: Timestamp.fromMillis(endTime),
        durationSeconds: durationSeconds,
        commentCount: comments.length,
        vibe: '🔥 Intense', // Could analyze this
        status: 'COMPLETED',
        comments: comments // Saving the chat history!
      };

      const docRef = await addDoc(collection(db, 'streams'), sessionData);
      console.log("Stream saved with ID: ", docRef.id);
    } catch (e) {
      console.error("Error saving stream:", e);
      alert("Failed to save stream history. Check console for details.");
    } finally {
      onExit();
    }
  };

  // Reliable Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      // Using scrollTo with behavior smooth
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [comments]);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
      {/* Strict Portrait Container */}
      <div className="relative w-full h-full overflow-hidden">

        {/* Camera Feed - Using object-cover to fill container strictly */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-black/80" />

        {/* Header UI */}
        <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-start z-30">
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-lg">
            <div className="relative">
              <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} className="w-9 h-9 rounded-full border-2 border-pink-500" alt="Me" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-black" />
            </div>
            <div>
              <p className="text-white text-[10px] font-bold leading-none tracking-tight">YOU</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="bg-red-600 text-[8px] px-1 rounded font-black text-white">LIVE</span>
                <span className="text-white/90 text-[10px] font-bold">{viewerCount}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleEndStream}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black tracking-widest uppercase active:scale-95 transition-all shadow-xl"
          >
            END
          </button>
        </div>

        {/* Syncing Indicator */}
        {isProcessing && (
          <div className="absolute top-20 right-5 z-30 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-2xl px-3 py-1.5 rounded-full border border-white/20 flex items-center space-x-2 shadow-2xl">
              <div className="w-2.5 h-2.5 border border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-white text-[8px] font-black tracking-widest uppercase opacity-70">SYNCING</span>
            </div>
          </div>
        )}

        {/* Dynamic Content Overlay (Subtitles + Chat) */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 z-20 pointer-events-none">

          {/* Subtitles: Appearing right above the chat */}
          <div className="mb-2 min-h-[40px] flex items-end">
            {currentSubtitle && (
              <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/5 inline-block max-w-[90%] animate-pulse">
                <p className="text-white/90 text-xs italic leading-snug">"{currentSubtitle}"</p>
              </div>
            )}
          </div>

          {/* Chat List: Anchored to the bottom, scrolls upwards */}
          <div className="flex flex-col max-h-[45vh] pointer-events-auto">
            <div
              ref={scrollRef}
              className="flex flex-col space-y-2 overflow-y-auto no-scrollbar comment-scroll-mask h-full pt-12 pb-4"
            >
              {/* Spacer to push content to bottom when list is short */}
              <div className="flex-1 min-h-[50px]" />

              {comments.map((comment) => (
                <div key={comment.id} className={`flex items-start space-x-2 animate-comment px-1 ${comment.personaId === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <img src={comment.avatar} className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0 bg-black/60 shadow-md" alt={comment.name} />
                  <div className={`flex flex-col max-w-[80%] ${comment.personaId === 'user' ? 'items-end' : ''}`}>
                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5">{comment.name}</span>
                    <div className={`backdrop-blur-2xl border border-white/10 px-3 py-2 shadow-xl rounded-xl ${comment.personaId === 'user' ? 'bg-indigo-600/50 rounded-tr-none' : 'bg-black/60 rounded-tl-none'}`}>
                      <p className="text-white/95 text-xs leading-tight font-medium">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input Container */}
          <div className="flex items-center space-x-2 mt-4 pointer-events-auto">
            <div className="flex-1 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-full h-12 px-5 flex items-center shadow-2xl focus-within:border-white/30 transition-all">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message your network..."
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-white/30"
              />
            </div>
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center border border-white/20 shadow-2xl active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
