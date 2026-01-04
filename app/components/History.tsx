import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Smile, Clock, ChevronRight, Search, Play, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types';

interface HistoryItem {
    id: string;
    title: string;
    description: string;
    timestamp?: any; // Legacy
    startTime?: any; // New field
    duration?: string; // Legacy string
    durationSeconds?: number; // New field
    commentCount: number;
    vibe: string;
    status: 'COMPLETED' | 'SAVED' | 'DRAFT';
    comments?: Comment[];
}

const History: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All Sessions');
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<HistoryItem | null>(null);

    const tabs = ['All Sessions', 'Favorites', 'Drafts', 'Archived'];

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setLoading(false);
                setHistoryItems([]);
                return;
            }

            try {
                const q = query(
                    collection(db, 'streams'),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem));
                // Sort by startTime or timestamp desc
                items.sort((a, b) => {
                    const timeA = a.startTime?.seconds || a.timestamp?.seconds || 0;
                    const timeB = b.startTime?.seconds || b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setHistoryItems(items);
            } catch (err) {
                console.error("Error fetching history:", err);
                setHistoryItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    const formatDate = (timestamp: any) => {
        if (!timestamp || !timestamp.seconds) return '';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' • ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (item: HistoryItem) => {
        if (item.duration) return item.duration;
        if (item.durationSeconds) {
            const mins = Math.floor(item.durationSeconds / 60);
            const secs = item.durationSeconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return '0:00';
    };

    if (selectedSession) {
        return (
            <div className="flex flex-col h-full bg-[#0B0B0B] text-white overflow-hidden relative">
                {/* Detail View Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#0B0B0B]/90 backdrop-blur-xl z-20">
                    <button
                        onClick={() => setSelectedSession(null)}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{selectedSession.title}</h2>
                        <p className="text-xs text-gray-400">{formatDate(selectedSession.startTime || selectedSession.timestamp)}</p>
                    </div>
                </div>

                {/* Chat Transcript */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    {selectedSession.comments && selectedSession.comments.length > 0 ? (
                        selectedSession.comments.map((comment) => (
                            <div key={comment.id} className={`flex items-start space-x-2 px-1 ${comment.personaId === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <img src={comment.avatar} className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0 bg-black/60 shadow-md" alt={comment.name} />
                                <div className={`flex flex-col max-w-[80%] ${comment.personaId === 'user' ? 'items-end' : ''}`}>
                                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5">{comment.name}</span>
                                    <div className={`backdrop-blur-2xl border border-white/10 px-3 py-2 shadow-xl rounded-xl ${comment.personaId === 'user' ? 'bg-indigo-600/50 rounded-tr-none' : 'bg-zinc-800/60 rounded-tl-none'}`}>
                                        <p className="text-white/95 text-xs leading-tight font-medium">{comment.text}</p>
                                    </div>
                                    <span className="text-[9px] text-gray-600 mt-1">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <MessageSquare className="w-12 h-12 opacity-20 mb-4" />
                            <p className="text-sm">No transcript available for this session.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0B0B0B] text-white overflow-hidden relative">
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-6 pt-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Past Streams</h1>
                    <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 text-gray-400">
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex space-x-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${activeTab === tab
                                ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:border-zinc-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {historyItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedSession(item)}
                            className="bg-[#161616] rounded-2xl p-5 border border-white/5 active:scale-[0.99] transition-transform cursor-pointer hover:border-white/10"
                        >

                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                        item.status === 'SAVED' ? 'bg-purple-500/10 text-purple-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {formatDate(item.startTime || item.timestamp)}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
                                {item.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-violet-400">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">{item.commentCount} comments</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <span className="text-xs">{item.vibe}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium font-mono">{formatDuration(item)}</span>
                                </div>
                            </div>

                        </div>
                    ))}

                    {historyItems.length === 0 && !loading && (
                        <div className="text-center py-20 opacity-50">
                            <p>No streams found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
