
/**
 * PANDUAN DEPLOYMENT (PENTING):
 * 
 * 1. Tempel kode Google Apps Script yang saya berikan di pesan sebelumnya ke Editor Apps Script.
 * 2. Klik "Deploy" -> "New Deployment".
 * 3. Pilih "Web App".
 * 4. Execute As: "Me" (Email Bapak).
 * 5. Who has access: "Anyone".
 * 6. Klik "Deploy".
 * 7. Copy "Web App URL" dan tempel di SCRIPT_URL di bawah ini.
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxV1cbE33T0sGMB8XGy6lHAjKezO-a-X8V2Fexx627HpWJe0pFxu_VLlPqnNKXmJVBeuQ/exec';

export const cloudSync = {
  save: async (data: any) => {
    try {
      // Gunakan stringify sekali saja untuk memastikan format valid
      const payload = JSON.stringify(data);
      
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Mode no-cors diperlukan untuk Google Apps Script
        headers: {
          'Content-Type': 'application/json',
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
      // Menambahkan timestamp t=... untuk mencegah browser mengambil cache lama
      const response = await fetch(`${SCRIPT_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const text = await response.text();
      // Parsing data dengan aman
      if (!text || text === "{}") return {};
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Muat dari Cloud gagal:', error);
      return null;
    }
  }
};
