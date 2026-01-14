
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RECEIPT_PROMPT = `
Extract structured data from this receipt image following SROIE (Scanned Receipts OCR and Information Extraction) patterns.
- Merchant: Official store/company name.
- Date: Date of transaction (YYYY-MM-DD).
- Total: Final amount paid (float).
- Currency: Symbol or code.
- Category: Categorize into: Food & Dining, Shopping, Travel & Transport, Utilities, Health, Entertainment, Other.
- RawText: A comprehensive string of all text found on the receipt for verification.

Return JSON format.
`;

export async function scanReceipt(base64Image: string): Promise<ScanResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: RECEIPT_PROMPT }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          merchant: { type: Type.STRING },
          date: { type: Type.STRING },
          total: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          category: { type: Type.STRING },
          rawText: { type: Type.STRING }
        },
        required: ["merchant", "date", "total", "category"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI model");
  
  try {
    const data = JSON.parse(text);
    return {
      merchant: data.merchant || 'Unknown Merchant',
      date: data.date || new Date().toISOString().split('T')[0],
      total: Number(data.total) || 0,
      currency: data.currency || '$',
      category: data.category || Category.Other,
      confidence: 0.98,
      rawText: data.rawText
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to interpret receipt data.");
  }
}
