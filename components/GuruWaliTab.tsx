
import React, { useState, useMemo } from 'react';
import { PengaturanData, WaliRecord } from '../types';
import { getWeekNumber, formatMinggu } from '../utils';
import { generateFollowUp } from '../geminiService';

interface GuruWaliTabProps {
  pengaturan: PengaturanData;
  waliData: WaliRecord[];
  setWaliData: React.Dispatch<React.SetStateAction<WaliRecord[]>>;
  showNotification: (msg: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const GuruWaliTab: React.FC<GuruWaliTabProps> = ({ 
  pengaturan, 
  waliData, 
  setWaliData, 
  showNotification,
  onSync,
  isSyncing
}) => {
  const [selection, setSelection] = useState({ kelas: '', siswa: '' });
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Akademik' as WaliRecord['kategori'],
    hadir: '0', sakit: '0', izin: '0', alfa: '0',
    uraian: '', tindakLanjut: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const studentsInClass = pengaturan.siswaBinaan.filter(s => s.kelas === selection.kelas);
  
  const filteredHistory = useMemo(() => {
    const sorted = [...waliData].sort((a, b) => b.id - a.id);
    if (!searchTerm.trim()) return sorted;
    
    const lowSearch = searchTerm.toLowerCase();
    return sorted.filter(r => 
      r.siswa.toLowerCase().includes(lowSearch) || 
      r.kelas.toLowerCase().includes(lowSearch) || 
      r.uraian.toLowerCase().includes(lowSearch) ||
      r.kategori.toLowerCase().includes(lowSearch)
    );
  }, [waliData, searchTerm]);

  const handleAiTindakLanjut = async () => {
    if (!formData.uraian.trim()) return showNotification("⚠️ Isi uraian masalah terlebih dahulu!");
    setIsAiLoading(true);
    try {
      const result = await generateFollowUp(formData.uraian);
      setFormData(prev => ({ ...prev, tindakLanjut: result.saran }));
      showNotification("✨ Saran AI Berhasil Dibuat!");
    } catch (err) { 
      showNotification("❌ Gagal memproses AI."); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection.siswa) return showNotification("⚠️ Pilih murid terlebih dahulu!");
    const { year, week } = getWeekNumber(new Date(formData.tanggal));
    const newRecord: WaliRecord = { 
      id: editingId || Date.now(), 
      siswa: selection.siswa, 
      kelas: selection.kelas, 
      tahun: year, 
      minggu: week, 
      kategori: formData.kategori, 
      hadir: formData.hadir, 
      sakit: formData.sakit, 
      izin: formData.izin, 
      alfa: formData.alfa, 
      uraian: formData.uraian, 
      tindakLanjut: formData.tindakLanjut 
    };
    
    setWaliData(prev => {
      if (editingId) {
        return prev.map(r => r.id === editingId ? newRecord : r);
      }
      return [newRecord, ...prev];
    });
    
    showNotification(editingId ? "✅ Catatan diperbarui!" : "✅ Catatan pendampingan disimpan!");
    handleReset();
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ 
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Akademik', 
      hadir: '0', sakit: '0', izin: '0', alfa: '0', 
      uraian: '', tindakLanjut: '' 
    });
    setSelection({ kelas: '', siswa: '' });
  };

  const handleEdit = (record: WaliRecord) => {
    setEditingId(record.id);
    setSelection({ kelas: record.kelas, siswa: record.siswa });
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      kategori: record.kategori,
      hadir: record.hadir,
      sakit: record.sakit,
      izin: record.izin,
      alfa: record.alfa,
      uraian: record.uraian,
      tindakLanjut: record.tindakLanjut
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      setWaliData(prev => prev.filter(r => r.id !== id));
      showNotification("🗑️ Catatan berhasil dihapus.");
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-50">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-indigo-100 p-3 rounded-2xl text-2xl">🤝</span> 
          ADMINISTRASI GURU WALI
        </h2>
        {onSync && (
          <button 
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-lg disabled:opacity-50"
          >
            {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ SINKRON GURU WALI</>}
          </button>
        )}
      </div>

      <div className="bg-gray-50/50 p-8 rounded-[32px] mb-10 border border-gray-100 no-print">
        <h3 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest ml-2">Input Pendampingan Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={selection.kelas} onChange={e => setSelection({...selection, kelas: e.target.value, siswa: ''})} className="p-4 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase shadow-sm outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">-- Pilih Kelas --</option>
            {pengaturan.waliKelas.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={selection.siswa} onChange={e => setSelection({...selection, siswa: e.target.value})} className="p-4 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase shadow-sm outline-none focus:ring-2 focus:ring-indigo-400" disabled={!selection.kelas}>
            <option value="">-- Pilih Murid Binaan --</option>
            {studentsInClass.map(s => <option key={s.nama} value={s.nama}>{s.nama}</option>)}
          </select>
        </div>
      </div>

      {selection.siswa && (
        <form onSubmit={handleSubmit} className="space-y-8 p-10 rounded-[40px] bg-indigo-50/30 border border-indigo-100 shadow-sm animate-fade-in mb-16 no-print">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 block ml-2">Tanggal Catatan</label>
              <input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full p-4 border-none bg-white rounded-2xl shadow-sm text-xs font-bold outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 block ml-2">Kategori Masalah</label>
              <select value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value as any})} className="w-full p-4 border-none bg-white rounded-2xl shadow-sm text-xs font-black uppercase outline-none">
                <option value="Akademik">Akademik</option>
                <option value="Karakter">Karakter</option>
                <option value="Kompetensi">Kompetensi</option>
                <option value="Sosial/Ekonomi">Sosial/Ekonomi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-3xl shadow-sm">
            {[ {k:'hadir', l:'H'}, {k:'sakit', l:'S'}, {k:'izin', l:'I'}, {k:'alfa', l:'A'} ].map(item => (
              <div key={item.k}>
                <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block text-center tracking-widest">{item.l}</label>
                <input type="number" min="0" value={(formData as any)[item.k]} onChange={e => setFormData({...formData, [item.k]: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-center font-black text-xs border-none outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 block ml-2">Uraian Kasus / Masalah</label>
            <textarea rows={4} value={formData.uraian} onChange={e => setFormData({...formData, uraian: e.target.value})} className="w-full p-6 border-none bg-white rounded-3xl shadow-sm text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Ketik kronologi atau pengamatan masalah..." />
            
            <button 
              type="button" 
              onClick={handleAiTindakLanjut} 
              disabled={isAiLoading} 
              className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {isAiLoading ? <div className="loader !w-4 !h-4" /> : "✨ SARAN STRATEGI AI"}
            </button>
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 block ml-2">Tindak Lanjut / Solusi</label>
            <textarea rows={4} value={formData.tindakLanjut} onChange={e => setFormData({...formData, tindakLanjut: e.target.value})} className="w-full p-6 border-none bg-white/70 rounded-3xl shadow-sm text-sm font-medium outline-none border-2 border-dashed border-indigo-200" placeholder="Hasil tindak lanjut atau saran AI akan muncul di sini..." />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-grow py-5 rounded-3xl bg-indigo-900 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl active:scale-95 hover:bg-black transition-all">
              {editingId ? '💾 PERBARUI CATATAN' : '💾 SIMPAN GURU WALI'}
            </button>
            <button type="button" onClick={handleReset} className="px-8 py-5 rounded-3xl bg-gray-200 text-gray-500 font-black uppercase text-[11px] tracking-widest hover:bg-gray-300">BATAL</button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Riwayat Pendampingan Guru WALI</h3>
          <div className="relative w-full md:w-80">
             <input 
              type="text" 
              placeholder="🔍 Cari Murid atau Kasus..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-400"
             />
             <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          </div>
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="text-center text-gray-300 italic py-24 bg-gray-50 rounded-[40px] border-2 border-dashed">
            {searchTerm ? "Tidak ada riwayat yang cocok." : "Belum ada riwayat pendampingan."}
          </div>
        ) : (
          filteredHistory.map(record => (
            <div key={record.id} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h5 className="font-black text-gray-800 text-xl tracking-tight">{record.siswa}</h5>
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{record.kategori}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-indigo-100">KELAS {record.kelas}</span>
                    <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{formatMinggu(record.tahun, record.minggu)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    {['H', 'S', 'I', 'A'].map((l, i) => (
                      <div key={l} className={`flex flex-col items-center min-w-[32px] ${i > 0 ? 'border-l border-gray-200' : ''}`}>
                        <span className="text-[7px] font-black text-gray-400 uppercase">{l}</span>
                        <span className={`text-[11px] font-black ${l==='H'?'text-emerald-600':l==='S'?'text-blue-600':l==='I'?'text-orange-600':'text-red-600'}`}>
                          {(record as any)[l==='H'?'hadir':l==='S'?'sakit':l==='I'?'izin':'alfa']}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 no-print ml-auto">
                    <button onClick={() => handleEdit(record)} className="p-2.5 bg-blue-50 text-blue-500 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm">✏️</button>
                    <button onClick={() => handleDelete(record.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white shadow-sm">🗑️</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50/50 p-6 rounded-2xl border-l-4 border-indigo-400 shadow-inner">
                  <p className="text-[9px] font-black text-indigo-400 uppercase mb-3 tracking-widest">Kasus:</p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed italic">"{record.uraian}"</p>
                </div>
                <div className="bg-emerald-50/30 p-6 rounded-2xl border-l-4 border-emerald-500 shadow-inner">
                   <p className="text-[9px] font-black text-emerald-600 uppercase mb-3 tracking-widest">Solusi:</p>
                   <p className="text-sm font-bold text-gray-800 leading-relaxed">{record.tindakLanjut}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuruWaliTab;
