
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PengaturanData } from '../types';

interface PengaturanTabProps {
  pengaturan: PengaturanData;
  setPengaturan: React.Dispatch<React.SetStateAction<PengaturanData>>;
  kelasData: string[];
  siswaData: Record<string, string[]>;
  showNotification: (msg: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
  onMigrasi?: (jsonStr: string) => void;
}

const PengaturanTab: React.FC<PengaturanTabProps> = ({ 
  pengaturan, 
  setPengaturan, 
  kelasData, 
  siswaData, 
  showNotification,
  onSync,
  isSyncing,
  onMigrasi
}) => {
  const [localData, setLocalData] = useState<PengaturanData>(pengaturan);
  const [binSiswa, setBinSiswa] = useState({ kelas: '', nama: '' });
  const [migrasiInput, setMigrasiInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalData(pengaturan);
  }, [pengaturan]);

  useEffect(() => {
    setBinSiswa(prev => ({ ...prev, nama: '' }));
  }, [binSiswa.kelas]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPengaturan(localData);
    showNotification("✅ Profil dan Penugasan berhasil disimpan ke perangkat!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification("⚠️ Ukuran foto terlalu besar (Maks 2MB)");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalData(prev => ({ ...prev, foto: base64String }));
        showNotification("✨ Foto profil baru dipilih! Klik SIMPAN untuk mempermanenkan.");
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const addWaliKelas = (k: string) => {
    if (!k || (localData.waliKelas || []).includes(k)) return;
    setLocalData(prev => ({ ...prev, waliKelas: [...(prev.waliKelas || []), k].sort() }));
  };

  const removeWaliKelas = (k: string) => {
    setLocalData(prev => ({ ...prev, waliKelas: (prev.waliKelas || []).filter(item => item !== k) }));
  };

  const addSiswaBinaan = () => {
    if (!binSiswa.nama || !binSiswa.kelas) {
      showNotification("Pilih kelas dan nama murid!");
      return;
    }
    const alreadyExists = (localData.siswaBinaan || []).some(s => s.nama === binSiswa.nama && s.kelas === binSiswa.kelas);
    if (alreadyExists) {
      showNotification("Murid sudah ada dalam daftar binaan.");
      return;
    }
    setLocalData(prev => ({
      ...prev,
      siswaBinaan: [...(prev.siswaBinaan || []), { nama: binSiswa.nama, kelas: binSiswa.kelas }]
    }));
    setBinSiswa({ kelas: '', nama: '' });
  };

  const removeSiswaBinaan = (idx: number) => {
    setLocalData(prev => {
      const newList = [...(prev.siswaBinaan || [])];
      newList.splice(idx, 1);
      return { ...prev, siswaBinaan: newList };
    });
  };

  const handleMigrasiAction = () => {
    if (!migrasiInput.trim()) return showNotification("⚠️ Tempel teks dari cell A1 DATABASE atau GuruWali!");
    if (onMigrasi) onMigrasi(migrasiInput);
    setMigrasiInput('');
  };

  const availableStudents = useMemo(() => {
    return binSiswa.kelas ? (siswaData[binSiswa.kelas] || []) : [];
  }, [binSiswa.kelas, siswaData]);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 space-y-12">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <span className="bg-teal-100 p-2 rounded-xl">⚙️</span>
            PENGATURAN PROFIL & PENUGASAN
          </h2>
        </div>
        
        <form onSubmit={handleSave} className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase text-teal-600 tracking-[0.2em] ml-2">Foto & Identitas Guru Mata Pelajaran</h3>
            <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-8 rounded-[32px] border border-gray-100">
              <div className="flex flex-col items-center gap-4">
                 <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-200 relative group">
                   <img src={localData.foto} alt="Preview Profil" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 </div>
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-teal-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md active:scale-95">Ganti Foto</button>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" />
              </div>
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <input value={localData.nama} onChange={e => setLocalData({...localData, nama: e.target.value})} placeholder="Nama Lengkap" className="p-4 border rounded-2xl font-bold bg-white text-sm outline-none" />
                <input value={localData.nip} onChange={e => setLocalData({...localData, nip: e.target.value})} placeholder="NIP" className="p-4 border rounded-2xl font-bold bg-white text-sm outline-none" />
                <input value={localData.mapel} onChange={e => setLocalData({...localData, mapel: e.target.value})} placeholder="Mata Pelajaran" className="p-4 border rounded-2xl font-bold bg-white text-sm outline-none" />
                <input value={localData.namaSekolah} onChange={e => setLocalData({...localData, namaSekolah: e.target.value})} placeholder="Sekolah" className="p-4 border rounded-2xl font-bold bg-white text-sm outline-none" />
              </div>
            </div>
          </div>

          <section className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100">
            <h3 className="text-[11px] font-black uppercase text-blue-600 mb-4 tracking-widest">Penugasan Wali Kelas</h3>
            <div className="flex gap-2 mb-4">
              <select value="" onChange={e => addWaliKelas(e.target.value)} className="flex-grow p-4 rounded-2xl border font-bold bg-white outline-none">
                <option value="">+ Tambah Kelas Binaan...</option>
                {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {(localData.waliKelas || []).map(k => (
                <span key={k} className="bg-white border-2 border-blue-100 px-4 py-2 rounded-full text-xs font-black text-blue-600 flex items-center gap-3">
                  {k} <button type="button" onClick={() => removeWaliKelas(k)} className="text-red-400 font-bold">×</button>
                </span>
              ))}
            </div>
          </section>

          <section className="p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100">
            <h3 className="text-[11px] font-black uppercase text-indigo-600 mb-4 tracking-widest">Murid Binaan Khusus (Logbook)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <select value={binSiswa.kelas} onChange={e => setBinSiswa({...binSiswa, kelas: e.target.value})} className="p-4 rounded-2xl border font-bold bg-white outline-none">
                <option value="">Pilih Kelas...</option>
                {(localData.waliKelas || []).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <select value={binSiswa.nama} onChange={e => setBinSiswa({...binSiswa, nama: e.target.value})} className="p-4 rounded-2xl border font-bold bg-white outline-none" disabled={!binSiswa.kelas}>
                <option value="">Pilih Nama...</option>
                {availableStudents.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="button" onClick={addSiswaBinaan} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest">TAMBAH KE DAFTAR BINAAN</button>
            <div className="mt-4 flex flex-wrap gap-2">
              {(localData.siswaBinaan || []).map((s, idx) => (
                <span key={`${s.kelas}-${s.nama}`} className="bg-white border-2 border-indigo-100 px-4 py-2 rounded-xl text-[10px] font-black text-indigo-600 flex items-center gap-3">
                  {s.nama} ({s.kelas}) <button type="button" onClick={() => removeSiswaBinaan(idx)} className="text-red-400 font-bold">×</button>
                </span>
              ))}
            </div>
          </section>

          <button type="submit" className="w-full bg-teal-600 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 hover:bg-teal-700 transition-all">💾 SIMPAN SELURUH PENGATURAN</button>
        </form>
      </div>

      <section className="p-8 bg-purple-50 rounded-[40px] border border-purple-100 no-print">
        <h3 className="text-[11px] font-black uppercase text-purple-700 mb-4 tracking-widest flex items-center gap-2">
          <span>🆘</span> MIGRASI DATA LAMA (DATABASE / GURU WALI)
        </h3>
        <p className="text-[10px] text-purple-600 mb-4 font-black leading-relaxed">
          PENTING: Gunakan fitur ini untuk memulihkan data lama Bapak.
        </p>
        <div className="space-y-4 text-[10px] text-gray-500 font-bold mb-6">
          <p>1. 📦 **MASTER BACKUP**: Copy teks dari **Cell A1 sheet DATABASE** untuk memulihkan SEMUA data.</p>
          <p>2. 🤝 **RIWAYAT GURU WALI**: Copy teks dari **Cell A1 sheet GuruWali** (atau sheet wali) untuk memulihkan riwayat pendampingan saja.</p>
        </div>
        <textarea 
          value={migrasiInput} 
          onChange={e => setMigrasiInput(e.target.value)}
          placeholder="Tempel teks kode dari Cell A1 di sini..."
          className="w-full p-6 bg-white border-2 border-dashed border-purple-200 rounded-[32px] text-[10px] font-mono mb-4 outline-none focus:ring-2 focus:ring-purple-400 min-h-[140px]"
        />
        <button 
          onClick={handleMigrasiAction}
          className="w-full py-5 rounded-3xl bg-purple-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-purple-700 transition-all active:scale-95"
        >
          🚀 PROSES PEMULIHAN DATA SEKARANG
        </button>
      </section>
    </div>
  );
};

export default PengaturanTab;
