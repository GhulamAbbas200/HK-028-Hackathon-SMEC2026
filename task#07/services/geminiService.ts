
import { GoogleGenAI } from "@google/genai";
import { User, Post, Comment } from "../types.ts";

export const generateAIResponse = async (
  aiUser: User,
  contextPost: Post,
  postAuthor: User,
  existingComments: Comment[]
): Promise<string | null> => {
  if (!process.env.API_KEY) return null;

  const prompt = `
    You are ${aiUser.displayName} (@${aiUser.username}). Bio: "${aiUser.bio}".
    Comment on this post by ${postAuthor.displayName}: "${contextPost.content}".
    Be witty, brief, and act like a real person. No emojis. Max 15 words.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || null;
  } catch (error) {
    return null;
  }
};

/**
 * Uses Google Search to bring REAL-TIME world events into the app
 */
export const generateGlobalPost = async (aiUser: User): Promise<{text: string, sources: any[]} | null> => {
  if (!process.env.API_KEY) return null;

  const prompt = `
    What is one major trending topic or news event happening RIGHT NOW in the world? 
    Write a short social media post (max 20 words) from the perspective of @${aiUser.username} (${aiUser.displayName}) talking about it.
    Make it feel urgent and real-time.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text?.trim() || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error("Failed to fetch real-time world data:", error);
    return null;
  }
};

export const generateRandomPost = async (aiUser: User): Promise<string | null> => {
  if (!process.env.API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a random thought as @${aiUser.username}. Max 15 words.`,
    });
    return response.text?.trim() || null;
  } catch (error) {
    return null;
  }
};
