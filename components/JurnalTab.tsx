
import React, { useState, useEffect } from 'react';
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
  const [editingId, setEditingId] = useState<number | null>(null);
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
    
    if (editingId) {
      setJurnalData(prev => {
        const entries = prev[formData.tanggal] || [];
        const updatedEntries = entries.map(entry => 
          entry.id === editingId 
            ? { ...entry, jam: formData.jam, kelas: formData.kelas, materi: formData.materi, kegiatan: formData.kegiatan }
            : entry
        );
        return { ...prev, [formData.tanggal]: updatedEntries };
      });
      showNotification("✅ Jurnal berhasil diperbarui!");
      setEditingId(null);
    } else {
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
      showNotification("✅ Jurnal berhasil disimpan!");
    }

    setFormData({ ...formData, jam: '', kelas: '', topik: '', materi: '', kegiatan: '' });
  };

  const startEdit = (entry: JurnalEntry) => {
    setEditingId(entry.id);
    setFormData({
      ...formData,
      jam: entry.jam,
      kelas: entry.kelas,
      materi: entry.materi,
      kegiatan: entry.kegiatan,
      topik: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ ...formData, jam: '', kelas: '', topik: '', materi: '', kegiatan: '' });
  };

  const hapusJurnal = (id: number) => {
    if (confirm("Hapus entri jurnal ini?")) {
      setJurnalData(prev => {
        const filtered = (prev[formData.tanggal] || []).filter(item => item.id !== id);
        const newState = { ...prev };
        if (filtered.length === 0) delete newState[formData.tanggal];
        else newState[formData.tanggal] = filtered;
        return newState;
      });
    }
  };

  const displayEntries = (jurnalData[formData.tanggal] || []).sort((a, b) => a.jam.localeCompare(b.jam));

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-50">
      <h2 className="text-2xl font-bold text-[#1F2937] mb-8 flex items-center gap-3">
        <span className="text-3xl">📝</span>
        {editingId ? 'Edit Jurnal Mengajar' : 'Input Jurnal Mengajar'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Tanggal</label>
            <input type="date" name="tanggal" value={formData.tanggal} onChange={handleInputChange} className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" required disabled={editingId !== null} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Jam Pelajaran</label>
            <select name="jam" value={formData.jam} onChange={handleInputChange} className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" required>
              <option value="">Pilih Jam</option>
              {jamData.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Kelas</label>
            <select name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" required>
              <option value="">Pilih Kelas</option>
              {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Mata Pelajaran</label>
            <input type="text" value={pengaturan.mapel} readOnly className="w-full p-3.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 font-medium" />
          </div>
        </div>

        {!editingId && (
          <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 space-y-4">
            <h3 className="text-base font-bold text-teal-800 flex items-center gap-2">✨ Asisten AI Pembelajaran</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                name="topik" 
                value={formData.topik} 
                onChange={handleInputChange} 
                placeholder="Masukkan topik, misal: Teknik Dasar Basket" 
                className="flex-grow p-3.5 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
              />
              <button 
                type="button" 
                onClick={handleAiGeneration} 
                disabled={isGenerating}
                className="bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-teal-700 transition flex items-center justify-center shadow-sm"
              >
                {isGenerating ? <div className="loader mr-2" /> : "Buat Draf"}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Materi Pembelajaran</label>
          <textarea name="materi" value={formData.materi} onChange={handleInputChange} rows={3} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" required />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Kegiatan Pembelajaran</label>
          <textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows={3} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" required />
        </div>
        
        <div className="flex gap-3">
          {editingId && (
            <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl hover:bg-gray-200 transition font-bold shadow-sm">
              BATAL
            </button>
          )}
          <button type="submit" className={`flex-[2] py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-[0.98] ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#008080] hover:bg-[#006666]'}`}>
            {editingId ? '💾 UPDATE JURNAL' : '💾 SIMPAN JURNAL'}
          </button>
        </div>
      </form>

      <div className="mt-12 border-t border-gray-50 pt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span> Jurnal Tanggal {formData.tanggal}
        </h3>
        {displayEntries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {displayEntries.map(entry => (
              <div key={entry.id} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative group hover:bg-white hover:shadow-lg transition-all">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => startEdit(entry)} className="bg-blue-50 text-blue-600 p-2 px-3 rounded-lg text-xs font-bold hover:bg-blue-100">✏️ Edit</button>
                  <button onClick={() => hapusJurnal(entry.id)} className="bg-red-50 text-red-500 p-2 px-3 rounded-lg text-xs font-bold hover:bg-red-100">🗑️ Hapus</button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Jam {entry.jam}</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Kelas {entry.kelas}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Materi:</strong> {entry.materi}</p>
                  <p className="text-sm text-gray-600 italic"><strong>Kegiatan:</strong> {entry.kegiatan}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Belum ada entri jurnal untuk tanggal ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JurnalTab;
