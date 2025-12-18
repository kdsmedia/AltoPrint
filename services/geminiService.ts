import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

// Fungsi helper untuk mendapatkan instance AI dengan aman
const getAIInstance = () => {
  // Menggunakan fallback jika API_KEY tidak terdefinisi agar tidak crash saat build
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || "";
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are an intelligent Point of Sale (POS) assistant. 
Your task is to convert natural language descriptions of sales, orders, or transactions into a structured JSON receipt format.
Extract merchant names, addresses, items, quantities, prices, and calculate totals if missing.
Always ensure the output is valid JSON conforming to the schema.
If specific details (like date or tax) are missing, infer reasonable defaults or use the current date.
`;

export const generateReceiptFromText = async (prompt: string): Promise<ReceiptData> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: { type: Type.STRING },
            merchantAddress: { type: Type.STRING },
            date: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  qty: { type: Type.NUMBER },
                  price: { type: Type.NUMBER }
                }
              }
            },
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            total: { type: Type.NUMBER },
            footerMessage: { type: Type.STRING },
            barcode: { type: Type.STRING }
          },
          required: ["merchantName", "items", "total", "date"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Tidak ada respon dari AI");
    
    return JSON.parse(text) as ReceiptData;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};