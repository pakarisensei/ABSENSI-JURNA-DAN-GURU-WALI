
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLessonPlan = async (topik: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Buatkan draf materi pembelajaran dan kegiatan pembelajaran untuk topik "${topik}".`,
    config: {
      systemInstruction: "Anda adalah asisten guru yang ahli dalam membuat rencana pembelajaran singkat untuk jurnal guru. Buatlah poin-poin ringkas dan jelas. Jawaban harus dalam format JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          materi: { type: Type.STRING },
          kegiatan: { type: Type.STRING }
        },
        required: ["materi", "kegiatan"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) throw new Error("No response from AI");
  return JSON.parse(resultText.trim());
};

export const generateFollowUp = async (uraian: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analisis masalah pendampingan berikut: "${uraian}"`,
    config: {
      systemInstruction: `Anda adalah pakar Guru Wali Profesional. 
      Tugas utama Anda adalah pendampingan intensif dan berkelanjutan (dari masuk hingga lulus) yang fokus pada pengembangan akademik, kompetensi, dan karakter.
      Berikan saran tindak lanjut yang mencakup:
      1. Langkah personal kepada murid (holistik).
      2. Koordinasi dengan orang tua (jembatan komunikasi).
      3. Koordinasi dengan Guru BK/Wali Kelas (kolaborasi internal).
      Gunakan bahasa Indonesia yang empatik namun profesional. Jawaban dalam format JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          saran: {
            type: Type.STRING,
            description: "Saran tindak lanjut terpadu"
          }
        },
        required: ["saran"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) throw new Error("No response from AI");
  return JSON.parse(resultText.trim());
};
