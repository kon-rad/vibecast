
import { GoogleGenAI } from "@google/genai";
import { AIPersona, Comment } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generatePersonaComment(
    persona: AIPersona,
    imageDataBase64: string,
    transcript: string,
    history: Comment[]
  ): Promise<string> {
    try {
      // Create a fresh instance to ensure the latest API key is used
      const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const recentHistory = history.slice(-8).map(c => `${c.name}: ${c.text}`).join('\n');

      const response = await aiInstance.models.generateContent({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: {
            parts: [
              {
                text: `YOU ARE: ${persona.name}, a ${persona.role}.
SYSTEM IDENTITY: ${persona.systemPrompt}
YOUR BIO: ${persona.bio}
YOUR PERSPECTIVE: ${persona.perspective}

INSTRUCTIONS:
1. You are watching a live stream. You see the host (video feed) and hear them (transcript).
2. Respond to what you see and hear.
3. STAY IN CHARACTER: Use your unique voice and professional bias.
4. BE BRIEF: Maximum 20 words. No hashtags.
5. BE REACTIVE: Respond specifically to the visual cues and spoken words.`
              }
            ]
          },
          temperature: 0.9,
          topP: 0.8,
          maxOutputTokens: 4000,
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageDataBase64,
                },
              },
              {
                text: `CONTEXT:
HOST'S RECENT WORDS: "${transcript || '[Host is silent]'}"

PREVIOUS CHAT MESSAGES:
${recentHistory || '[No messages yet]'}`
              },
            ],
          },
        ]
      });
      console.log("response: ", response);

      let responseText = "";
      // Handle both property and function access for response.text to be safe
      if (typeof response.text === 'function') {
        // @ts-ignore
        responseText = response.text();
      } else if (response.text) {
        responseText = response.text.toString();
      }

      if (!responseText) {
        console.warn(`Empty response from Gemini for ${persona.name}`);
        return "Watching closely... interesting point.";
      }
      return responseText.trim();
    } catch (error) {
      console.error(`Gemini Error for ${persona.name}:`, error);
      return "The connection is flickering, but I'm following...";
    }
  }
}

export const geminiService = new GeminiService();
