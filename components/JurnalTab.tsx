
import React, { useState, useMemo } from 'react';
import { PengaturanData, JurnalData, JurnalEntry } from '../types';
import { generateLessonPlan } from '../geminiService';
import { formatHariTanggal } from '../utils';

interface JurnalTabProps {
  pengaturan: PengaturanData;
  jurnalData: JurnalData;
  setJurnalData: React.Dispatch<React.SetStateAction<JurnalData>>;
  kelasData: string[];
  jamData: string[];
  showNotification: (msg: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const JurnalTab: React.FC<JurnalTabProps> = ({ 
  pengaturan, 
  jurnalData, 
  setJurnalData, 
  kelasData, 
  jamData, 
  showNotification,
  onSync,
  isSyncing
}) => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jam: '',
    kelas: '',
    topik: '',
    materi: '',
    kegiatan: ''
  });
  const [editingId, setEditingId] = useState<{id: number, tanggal: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAiGeneration = async () => {
    if (!formData.topik) {
      showNotification("⚠️ Masukkan topik utama terlebih dahulu!");
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
      showNotification("✨ Materi berhasil disusun AI!");
    } catch (err) {
      showNotification("❌ Gagal memanggil AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setJurnalData(prev => {
        const entries = prev[editingId.tanggal] || [];
        const updatedEntries = entries.map(entry => 
          entry.id === editingId.id 
            ? { ...entry, jam: formData.jam, kelas: formData.kelas, materi: formData.materi, kegiatan: formData.kegiatan }
            : entry
        );
        return { ...prev, [editingId.tanggal]: updatedEntries };
      });
      showNotification("✅ Jurnal diperbarui!");
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
      setJurnalData(prev => ({ ...prev, [formData.tanggal]: [...(prev[formData.tanggal] || []), newEntry] }));
      showNotification("✅ Jurnal disimpan!");
    }
    setFormData({ ...formData, jam: '', kelas: '', topik: '', materi: '', kegiatan: '' });
  };

  const startEdit = (date: string, entry: JurnalEntry) => {
    setEditingId({ id: entry.id, tanggal: date });
    setFormData({ ...formData, tanggal: date, jam: entry.jam, kelas: entry.kelas, materi: entry.materi, kegiatan: entry.kegiatan, topik: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (date: string, id: number) => {
    if (window.confirm("Hapus catatan jurnal ini?")) {
      setJurnalData(prev => {
        const filtered = (prev[date] || []).filter(e => e.id !== id);
        const newData = { ...prev };
        if (filtered.length === 0) delete newData[date];
        else newData[date] = filtered;
        return newData;
      });
      showNotification("🗑️ Jurnal dihapus.");
    }
  };

  const allEntries = useMemo(() => {
    const list: { date: string, entry: JurnalEntry }[] = [];
    Object.entries(jurnalData).forEach(([date, entries]) => entries.forEach(entry => list.push({ date, entry })));
    return list.sort((a, b) => b.date.localeCompare(a.date) || a.entry.jam.localeCompare(b.entry.jam))
               .filter(item => 
                 item.entry.materi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 item.entry.kelas.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 item.date.includes(searchTerm)
               );
  }, [jurnalData, searchTerm]);

  return (
    <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-50">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-teal-100 p-3 rounded-2xl text-2xl">📝</span>
          JURNAL MENGAJAR
        </h2>
        {onSync && (
          <button 
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-teal-700 shadow-lg disabled:opacity-50"
          >
            {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ SIMPAN JURNAL</>}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 mb-16 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
             <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Tanggal</label>
             <input type="date" name="tanggal" value={formData.tanggal} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl font-bold shadow-inner outline-none focus:ring-2 focus:ring-teal-500" required disabled={editingId !== null} />
          </div>
          <div className="space-y-1">
             <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Jam Ke</label>
             <select name="jam" value={formData.jam} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl font-bold shadow-inner outline-none focus:ring-2 focus:ring-teal-500" required>
                <option value="">Pilih Jam...</option>
                {jamData.map(j => <option key={j} value={j}>Jam {j}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Kelas</label>
             <select name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl font-bold shadow-inner outline-none focus:ring-2 focus:ring-teal-500" required>
                <option value="">Pilih Kelas...</option>
                {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Mata Pelajaran</label>
             <input type="text" value={pengaturan.mapel} readOnly className="w-full p-4 bg-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400" />
          </div>
        </div>

        <div className="bg-teal-50 p-8 rounded-[32px] border border-teal-100 space-y-4">
          <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest flex items-center gap-2">✨ ASISTEN AI JURNAL</h3>
          <div className="flex gap-2">
            <input name="topik" value={formData.topik} onChange={handleInputChange} placeholder="Ketik Topik (Misal: Permainan Bola Besar)" className="flex-grow p-4 bg-white rounded-2xl shadow-sm outline-none font-medium" />
            <button type="button" onClick={handleAiGeneration} disabled={isGenerating} className="bg-teal-600 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-teal-700 transition-all">
              {isGenerating ? <div className="loader" /> : "GENERATE"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-teal-600 ml-2">Uraian Materi</label>
             <textarea name="materi" value={formData.materi} onChange={handleInputChange} rows={4} className="w-full p-6 bg-gray-50 rounded-3xl font-medium shadow-inner outline-none focus:ring-2 focus:ring-teal-500" placeholder="Ketik materi yang diajarkan..." required />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase text-teal-600 ml-2">Kegiatan Pembelajaran</label>
             <textarea name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} rows={4} className="w-full p-6 bg-gray-50 rounded-3xl font-medium shadow-inner outline-none focus:ring-2 focus:ring-teal-500" placeholder="Ketik langkah-langkah kegiatan..." required />
           </div>
        </div>
        
        <button type="submit" className={`w-full py-5 rounded-3xl font-black text-white shadow-xl uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-900 hover:bg-black'}`}>
          {editingId ? '💾 PERBARUI JURNAL' : '💾 SIMPAN CATATAN JURNAL'}
        </button>
      </form>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Seluruh Riwayat Jurnal Mengajar</h3>
          <input type="text" placeholder="🔍 Cari Materi / Kelas / Tanggal..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-3 px-6 bg-gray-50 border rounded-2xl text-[11px] font-bold w-full md:w-80 outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {allEntries.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed text-gray-300 font-bold uppercase text-[10px] tracking-widest">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada riwayat jurnal"}
          </div>
        ) : (
          allEntries.map(({ date, entry }) => (
            <div key={`${date}-${entry.id}`} className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:shadow-md transition-all relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-teal-500 opacity-20"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{formatHariTanggal(date)}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">JAM {entry.jam}</span>
                    <span className="bg-teal-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">KELAS {entry.kelas}</span>
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{entry.mapel}</span>
                  </div>
                </div>
                <div className="flex gap-2 no-print">
                  <button onClick={() => startEdit(date, entry)} className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">✏️</button>
                  <button onClick={() => handleDelete(date, entry.id)} className="bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm">🗑️</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-50">
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Materi Utama</h4>
                  <p className="text-sm font-bold text-gray-800 leading-relaxed">{entry.materi}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kegiatan Belajar</h4>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed italic">"{entry.kegiatan}"</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JurnalTab;
