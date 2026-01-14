
import { GoogleGenAI, Type } from "@google/genai";

export async function enhanceTaskDescription(title: string, rawDesc: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an expert task board manager, rewrite this task description to be more professional and clear for students. 
      Title: ${title}
      Raw Description: ${rawDesc}
      Return ONLY the rewritten text.`,
    });
    return response.text || rawDesc;
  } catch (error) {
    console.error("Gemini Error:", error);
    return rawDesc;
  }
}

export async function suggestCategory(title: string, description: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given the task title "${title}" and description "${description}", pick the best category from: Academic Tutoring, Graphic Design, Software Development, Writing & Translation, Video & Audio, Research, Other. Return ONLY the category name.`,
    });
    return response.text?.trim() || "Other";
  } catch {
    return "Other";
  }
}

export async function analyzePortfolioSkills(tasks: {title: string, description: string}[]): Promise<string[]> {
  if (tasks.length === 0) return [];
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these completed tasks, list the top 5 relevant professional skills this person demonstrated. 
      Tasks: ${JSON.stringify(tasks)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
