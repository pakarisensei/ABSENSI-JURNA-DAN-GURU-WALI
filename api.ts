
/**
 * CLOUD SYNC SETTINGS - 7-SHEET STABLE VERSION
 */

// Ganti URL ini dengan URL Web App dari Google Apps Script Bapak
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-Sh0e5yCQg0GzJlEU8-OnJxcGHQuFasguz757fYWFSHsJMq8ApgtIRoOuXW5GJe50/exec';

export const cloudSync = {
  /**
   * Menyimpan seluruh data aplikasi ke 7 Sheet berbeda secara atomik
   */
  saveAll: async (fullData: any) => {
    try {
      const payload = JSON.stringify({
        action: 'save_all',
        payload: fullData,
        timestamp: new Date().toISOString()
      });
      
      // Menggunakan text/plain agar tidak memicu preflight CORS yang rumit di Apps Script
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
      });

      return true;
    } catch (error) {
      console.error("Gagal sinkronisasi total:", error);
      return false;
    }
  },

  /**
   * Memuat seluruh data dari 7 Sheet sekaligus
   */
  load: async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=load_all&t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Koneksi ke server Cloud bermasalah');
      
      const result = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Load data Cloud error:', error);
      return null;
    }
  }
};
