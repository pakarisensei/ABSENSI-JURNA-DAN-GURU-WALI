
// GANTI URL INI dengan URL dari Google Apps Script Anda
// Pastikan nama Google Sheets Anda adalah "Database Guru Wali"
const SCRIPT_URL = 'PASTE_URL_APPS_SCRIPT_ANDA_DISINI';

export const cloudSync = {
  save: async (data: any) => {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  },
  load: async () => {
    try {
      const response = await fetch(SCRIPT_URL);
      return await response.json();
    } catch (error) {
      console.error('Load failed:', error);
      throw error;
    }
  }
};
