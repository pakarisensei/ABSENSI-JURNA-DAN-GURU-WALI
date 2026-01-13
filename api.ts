
/**
 * PANDUAN CLOUD SYNC:
 * 
 * SCRIPT_URL adalah link Web App dari Google Apps Script Bapak.
 * Pastikan fungsi doPost(e) di script tersebut menggunakan:
 * var data = JSON.parse(e.postData.contents);
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxV1cbE33T0sGMB8XGy6lHAjKezO-a-X8V2Fexx627HpWJe0pFxu_VLlPqnNKXmJVBeuQ/exec';

export const cloudSync = {
  save: async (data: any) => {
    try {
      const payload = JSON.stringify(data);
      
      // Menggunakan mode: 'no-cors' agar tidak terhambat kebijakan browser
      // Data tetap terkirim ke Google Apps Script melalui postData.contents
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
      });

      return { status: "success" };
    } catch (error) {
      console.error('Simpan ke Cloud gagal:', error);
      throw error;
    }
  },
  load: async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Gagal menghubungi server Cloud.');
      
      const text = await response.text();
      
      if (!text || text.trim() === "" || text.includes("<!DOCTYPE") || text.trim() === "{}") {
        console.warn("Cloud masih kosong.");
        return null;
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Muat dari Cloud gagal:', error);
      return null;
    }
  }
};
