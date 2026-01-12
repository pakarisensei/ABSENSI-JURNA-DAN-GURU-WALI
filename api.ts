
/**
 * PANDUAN GOOGLE APPS SCRIPT:
 * 
 * 1. Buka Google Sheets (beri nama "Database Guru Wali").
 * 2. Extensions > Apps Script.
 * 3. Copy-Paste kode di bawah ini ke editor Apps Script:
 * 
 * function doGet() {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CloudData");
 *   if(!sheet) return ContentService.createTextOutput(JSON.stringify({})).setMimeType(ContentService.MimeType.JSON);
 *   var data = sheet.getRange(1, 1).getValue();
 *   return ContentService.createTextOutput(data || "{}").setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CloudData");
 *   if(!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("CloudData");
 *   sheet.getRange(1, 1).setValue(e.postData.contents);
 *   return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * 4. Deploy > New Deployment > Web App > Access: Anyone.
 * 5. Copy URL-nya dan tempel di SCRIPT_URL di bawah ini.
 */

const SCRIPT_URL = https://script.google.com/macros/s/AKfycbyWtVYu1_zH7gfSAgJoSADb6LSk50416pqfBzJO8AGpgzuC9NW4sK6G0Sdpr6hm_e2qew/exec;

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
