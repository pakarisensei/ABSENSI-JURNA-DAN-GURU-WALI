
import React, { useState } from 'react';
import { PengaturanData, JurnalData, JurnalEntry } from '../types';
import { generateLessonPlan } from '../geminiService';

interface JurnalTabProps {
  pengaturan: PengaturanData;
  jurnalData: JurnalData;
  setJurnalData: React.Dispatch<React.SetStateAction<JurnalData>>;
  kelasData: string[];
  jamData: string[];
  showNotification: (msg: string) => void;
}

const JurnalTab: React.FC<JurnalTabProps> = ({ 
  pengaturan, 
  jurnalData, 
  setJurnalData, 
  kelasData, 
  jamData, 
  showNotification 
}) => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jam: '',
    kelas: '',
    topik: '',
    materi: '',
    kegiatan: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAiGeneration = async () => {
    if (!formData.topik) {
      showNotification("Masukkan topik utama terlebih dahulu!");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateLessonPlan(formData.topik);
      setFormData(prev => ({
        ...prev,
        materi: result.materi,
        kegiatan: result.kegiatan
      }));
      showNotification("✨ Materi berhasil dibuat oleh AI!");
    } catch (err) {
      showNotification("Gagal memanggil AI. Pastikan API key Anda valid.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: JurnalEntry = {
      id: Date.now(),
      jam: formData.jam,
      kelas: formData.kelas,
      mapel: pengaturan.mapel,
      materi: formData.materi,
      kegiatan: formData.kegiatan
    };

    setJurnalData(prev => {
      const existing = prev[formData.tanggal] || [];
      return { ...prev, [formData.tanggal]: [...existing, newEntry] };
    });

    setFormData({ ...formData, jam: '', kelas: '', topik: '', materi: '', kegiatan: '' });
    showNotification("✅ Jurnal berhasil disimpan!");
  };

  const hapusJurnal = (id: number) => {
    setJurnalData(prev => {
      const filtered = (prev[formData.tanggal] || []).filter(item => item.id !== id);
      const newState = { ...prev };
      if (filtered.length === 0) delete newState[formData.tanggal];
      else newState[formData.tanggal] = filtered;
      return newState;
    });
  };

  const displayEntries = (jurnalData[formData.tanggal] || []).sort((a, b) => a.jam.localeCompare(b.jam));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Input Jurnal Mengajar</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
            <input type="date" name="tanggal" value={formData.tanggal} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jam Pelajaran</label>
            <select name="jam" value={formData.jam} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
              <option value="">Pilih Jam</option>
              {jamData.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
            <select name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
              <option value="">Pilih Kelas</option>
              {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
            <input type="text" value={pengaturan.mapel} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
        </div>

        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 space-y-3">
          <h3 className="text-lg font-semibold text-teal-800">✨ Asisten AI Pembelajaran</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              name="topik" 
              value={formData.topik} 
              onChange={handleInputChange} 
              placeholder="Contoh: Teknik Passing Basket" 
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" 
            />
            <button 
              type="button" 
              onClick={handleAiGeneration} 
              disabled={isGenerating}
              className="bg-teal-600 text-white px-6 rounded-lg hover:bg-teal-700 transition flex items-center"
            >
              {isGenerating ? <div className="loader mr-2" /> : "Buat Draf"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Materi Pembelajaran</label>
          <textarea name="materi" value={formData.materi} onChange={handleInputChange} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kegiatan Pembelajaran</label>
          <textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
        </div>
        
        <button type="submit" className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition font-bold shadow-md">
          💾 SIMPAN JURNAL
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Jurnal Tanggal {formData.tanggal}</h3>
        {displayEntries.length > 0 ? (
          <div className="space-y-4">
            {displayEntries.map(entry => (
              <div key={entry.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                <button 
                  onClick={() => hapusJurnal(entry.id)} 
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  Hapus
                </button>
                <p className="font-bold text-teal-700">{entry.kelas} (Jam {entry.jam})</p>
                <div className="mt-2 text-sm">
                  <p><strong>Materi:</strong> {entry.materi}</p>
                  <p className="mt-1"><strong>Kegiatan:</strong> {entry.kegiatan}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Belum ada entri jurnal untuk tanggal ini.</p>
        )}
      </div>
    </div>
  );
};

export default JurnalTab;
