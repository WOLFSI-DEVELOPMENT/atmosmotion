import { GoogleGenAI } from '@google/genai';
import { Type } from '@google/genai';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: "Hello" }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             textResponse: { type: Type.STRING }
          }
        }
      }
    });
    console.log("Success 3.5");
  } catch (e) {
    console.error("3.5 failed:", e.message);
  }
}
test();
