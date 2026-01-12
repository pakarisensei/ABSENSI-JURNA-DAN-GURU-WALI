
import { GoogleGenAI, Type } from "@google/genai";

export const generateLessonPlan = async (topik: string) => {
  // Always use the API key from process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Buatkan draf materi pembelajaran dan kegiatan pembelajaran untuk topik "${topik}". 
    Materi harus berupa poin-poin singkat yang mencakup konsep-konsep kunci. 
    Kegiatan pembelajaran harus mencakup pendahuluan, inti, dan penutup yang praktis dan ringkas.`,
    config: {
      systemInstruction: "Anda adalah asisten guru yang ahli dalam membuat rencana pembelajaran singkat untuk jurnal guru. Buatlah poin-poin ringkas dan jelas. Jawaban harus dalam format JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          materi: {
            type: Type.STRING,
            description: "Poin-poin materi pembelajaran"
          },
          kegiatan: {
            type: Type.STRING,
            description: "Poin-poin kegiatan pembelajaran"
          }
        },
        required: ["materi", "kegiatan"]
      }
    }
  });

  // Extracting text output from GenerateContentResponse using the .text property
  const resultText = response.text;
  if (!resultText) {
    throw new Error("No response from AI");
  }

  return JSON.parse(resultText.trim());
};
