
import React, { useState, useEffect, useMemo } from 'react';
import { PengaturanData, WaliRecord } from '../types';
import { getWeekNumber, formatMinggu } from '../utils';
import { generateFollowUp } from '../geminiService';

interface GuruWaliTabProps {
  pengaturan: PengaturanData;
  waliData: WaliRecord[];
  setWaliData: React.Dispatch<React.SetStateAction<WaliRecord[]>>;
  showNotification: (msg: string) => void;
}

const GuruWaliTab: React.FC<GuruWaliTabProps> = ({ 
  pengaturan, 
  waliData, 
  setWaliData, 
  showNotification 
}) => {
  const [selection, setSelection] = useState({
    kelas: '',
    siswa: ''
  });
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Akademik' as WaliRecord['kategori'],
    hadir: '0',
    sakit: '0',
    izin: '0',
    alfa: '0',
    uraian: '',
    tindakLanjut: ''
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const studentsInClass = pengaturan.siswaBinaan.filter(s => s.kelas === selection.kelas);

  // Menampilkan SEMUA riwayat secara global (tanpa filter kelas per kelas)
  const allHistory = useMemo(() => {
    return [...waliData].sort((a, b) => {
      if (a.tahun !== b.tahun) return b.tahun - a.tahun;
      return b.minggu - a.minggu;
    });
  }, [waliData]);

  useEffect(() => {
    if (selection.siswa && selection.kelas && !editingId) {
      const { year, week } = getWeekNumber(new Date(formData.tanggal));
      const record = waliData.find(r => r.siswa === selection.siswa && r.kelas === selection.kelas && r.tahun === year && r.minggu === week);
      if (record) {
        setFormData(prev => ({
          ...prev,
          kategori: record.kategori,
          hadir: record.hadir,
          sakit: record.sakit,
          izin: record.izin,
          alfa: record.alfa,
          uraian: record.uraian,
          tindakLanjut: record.tindakLanjut
        }));
      } else {
        setFormData(prev => ({ ...prev, kategori: 'Akademik', hadir: '0', sakit: '0', izin: '0', alfa: '0', uraian: '', tindakLanjut: '' }));
      }
    }
  }, [selection.siswa, formData.tanggal, waliData, editingId]);

  const handleAiTindakLanjut = async () => {
    if (!formData.uraian.trim()) {
      showNotification("Silakan isi uraian masalah bimbingan!");
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateFollowUp(formData.uraian);
      setFormData(prev => ({ ...prev, tindakLanjut: result.saran }));
      showNotification("✨ Strategi Pakar AI telah disusun!");
    } catch (err) {
      showNotification("Gagal menghubungi AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const startEdit = (record: WaliRecord) => {
    setEditingId(record.id);
    setSelection({ kelas: record.kelas, siswa: record.siswa });
    setFormData({
      ...formData,
      kategori: record.kategori,
      hadir: record.hadir,
      sakit: record.sakit,
      izin: record.izin,
      alfa: record.alfa,
      uraian: record.uraian,
      tindakLanjut: record.tindakLanjut
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showNotification(`✏️ Mengedit pendampingan ${record.siswa}`);
  };

  const handleHapus = (id: number) => {
    if (confirm("Hapus catatan pendampingan ini?")) {
      setWaliData(prev => prev.filter(r => r.id !== id));
      showNotification("🗑️ Catatan berhasil dihapus.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ ...formData, kategori: 'Akademik', hadir: '0', sakit: '0', izin: '0', alfa: '0', uraian: '', tindakLanjut: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection.siswa) return showNotification("Pilih murid terlebih dahulu!");

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
      const filtered = prev.filter(r => {
        if (editingId) return r.id !== editingId;
        return !(r.siswa === selection.siswa && r.kelas === selection.kelas && r.tahun === year && r.minggu === week);
      });
      return [...filtered, newRecord];
    });

    showNotification("✅ Data Pendampingan Berhasil Disimpan.");
    setEditingId(null);
    setFormData({ ...formData, kategori: 'Akademik', hadir: '0', sakit: '0', izin: '0', alfa: '0', uraian: '', tindakLanjut: '' });
  };

  if (pengaturan.waliKelas.length === 0) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg">
        <p className="font-bold uppercase text-xs mb-1">Perhatian</p>
        <p className="text-sm">Anda belum mengatur kelas binaan di tab Pengaturan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span className="bg-indigo-100 p-2 rounded-xl">🤝</span> 
        {editingId ? 'Edit Data Pendampingan' : 'Pendampingan Intensif Murid Binaan'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kelas Binaan</label>
          <select value={selection.kelas} onChange={e => setSelection({...selection, kelas: e.target.value, siswa: ''})} disabled={editingId !== null} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-gray-700">
            <option value="">-- Pilih Kelas --</option>
            {pengaturan.waliKelas.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Murid Binaan</label>
          <select value={selection.siswa} onChange={e => setSelection({...selection, siswa: e.target.value})} disabled={editingId !== null} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-gray-700">
            <option value="">-- Pilih Murid --</option>
            {studentsInClass.map(s => <option key={s.nama} value={s.nama}>{s.nama}</option>)}
          </select>
        </div>
      </div>

      {selection.siswa && (
        <form onSubmit={handleSubmit} className={`space-y-6 p-6 md:p-8 rounded-3xl border shadow-inner animate-fade-in transition-all ${editingId ? 'bg-orange-50 border-orange-200 shadow-orange-50' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 shadow-indigo-50'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 pb-4 mb-4">
            <div>
              <h4 className="text-xl font-black text-indigo-900 tracking-tight">{selection.siswa}</h4>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Fokus: Jangka Panjang & Holistik</p>
            </div>
            <div className="flex gap-2">
              <select 
                value={formData.kategori} 
                onChange={e => setFormData({...formData, kategori: e.target.value as WaliRecord['kategori']})}
                className="p-3 border-none bg-white rounded-xl shadow-sm text-xs font-bold text-indigo-800 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Akademik">Akademik</option>
                <option value="Karakter">Karakter / Budi Pekerti</option>
                <option value="Kompetensi">Kompetensi / Skill</option>
                <option value="Sosial/Ekonomi">Sosial / Ekonomi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="p-3 border-none bg-white rounded-xl shadow-sm text-xs font-bold text-indigo-800" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {(['hadir', 'sakit', 'izin', 'alfa'] as const).map(f => (
              <div key={f} className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-50">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{f}</label>
                <input type="number" min="0" value={formData[f]} onChange={e => setFormData({...formData, [f]: e.target.value})} className="w-full p-1 border-none focus:ring-0 text-center font-black text-indigo-900 text-lg" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-black text-indigo-800 uppercase tracking-widest mb-2 ml-1">Uraian Masalah & Dinamika Murid</label>
            <textarea rows={3} value={formData.uraian} onChange={e => setFormData({...formData, uraian: e.target.value})} className="w-full p-4 border-none bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-sm" placeholder="Ceritakan perkembangan murid secara detail..." />
          </div>

          <div className="relative pt-2">
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-black text-indigo-800 uppercase tracking-widest">Strategi & Tindak Lanjut Terpadu</label>
              <button type="button" onClick={handleAiTindakLanjut} disabled={isAiLoading} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                {isAiLoading ? <div className="loader !w-3 !h-3" /> : "✨ Strategi Pakar AI"}
              </button>
            </div>
            <textarea rows={3} value={formData.tindakLanjut} onChange={e => setFormData({...formData, tindakLanjut: e.target.value})} className="w-full p-4 border-none bg-white/70 rounded-2xl shadow-sm text-sm italic text-gray-700" placeholder="Langkah konkrit pendampingan..." />
          </div>

          <div className="flex gap-3 mt-4">
            {editingId && (
              <button type="button" onClick={cancelEdit} className="flex-1 py-4 rounded-2xl bg-gray-500 text-white font-black text-xs tracking-widest uppercase shadow-lg">BATAL</button>
            )}
            <button type="submit" className={`flex-[2] py-4 rounded-2xl font-black shadow-xl text-xs tracking-widest uppercase transition-all active:scale-95 ${editingId ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
               {editingId ? '💾 UPDATE PERUBAHAN' : '💾 SIMPAN PENDAMPINGAN'}
            </button>
          </div>
        </form>
      )}

      {/* Tampilan Riwayat Keseluruhan */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
             <span className="bg-gray-100 p-2 rounded-lg text-lg">📋</span>
             Logbook Pendampingan Guru Wali
           </h3>
           <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
             Total: {allHistory.length} Record
           </span>
        </div>

        {allHistory.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {allHistory.map(record => (
              <div key={record.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                {/* Border Indikator Kategori */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  record.kategori === 'Akademik' ? 'bg-blue-500' :
                  record.kategori === 'Karakter' ? 'bg-purple-500' :
                  record.kategori === 'Kompetensi' ? 'bg-emerald-500' :
                  record.kategori === 'Sosial/Ekonomi' ? 'bg-orange-500' : 'bg-gray-400'
                }`}></div>

                {/* Tombol Aksi */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(record)} className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-100" title="Edit Data">✏️</button>
                  <button onClick={() => handleHapus(record.id)} className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Hapus Data">🗑️</button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter">Kelas {record.kelas}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatMinggu(record.tahun, record.minggu)}</span>
                    </div>
                    <h5 className="font-black text-gray-800 text-xl leading-tight mb-2">{record.siswa}</h5>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                       <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${
                          record.kategori === 'Akademik' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          record.kategori === 'Karakter' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          record.kategori === 'Kompetensi' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-gray-50 text-gray-600 border-gray-100'
                       }`}>
                         {record.kategori}
                       </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                       <div className="text-center bg-green-50 rounded-lg py-1.5 border border-green-100">
                          <p className="text-[8px] font-black text-green-400 uppercase leading-none">H</p>
                          <p className="text-sm font-black text-green-700">{record.hadir}</p>
                       </div>
                       <div className="text-center bg-orange-50 rounded-lg py-1.5 border border-orange-100">
                          <p className="text-[8px] font-black text-orange-400 uppercase leading-none">S</p>
                          <p className="text-sm font-black text-orange-700">{record.sakit}</p>
                       </div>
                       <div className="text-center bg-yellow-50 rounded-lg py-1.5 border border-yellow-100">
                          <p className="text-[8px] font-black text-yellow-500 uppercase leading-none">I</p>
                          <p className="text-sm font-black text-yellow-700">{record.izin}</p>
                       </div>
                       <div className="text-center bg-red-50 rounded-lg py-1.5 border border-red-100">
                          <p className="text-[8px] font-black text-red-400 uppercase leading-none">A</p>
                          <p className="text-sm font-black text-red-700">{record.alfa}</p>
                       </div>
                    </div>
                  </div>

                  <div className="md:w-2/3 md:pl-6 border-l-0 md:border-l border-gray-100">
                    <div className="mb-3">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Uraian Masalah & Dinamika</p>
                      <p className="text-sm text-gray-700 leading-relaxed italic line-clamp-2">{record.uraian || "Tidak ada uraian."}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase mb-1 tracking-widest">Tindak Lanjut & Strategi</p>
                      <p className="text-sm text-indigo-900 font-bold leading-relaxed line-clamp-2">{record.tindakLanjut || "Belum ada rencana tindak lanjut."}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dotted border-gray-200">
            <div className="text-5xl mb-4 opacity-30">📂</div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada catatan pendampingan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuruWaliTab;
