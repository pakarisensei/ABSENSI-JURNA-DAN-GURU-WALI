
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
}

const PengaturanTab: React.FC<PengaturanTabProps> = ({ 
  pengaturan, 
  setPengaturan, 
  kelasData, 
  siswaData, 
  showNotification,
  onSync,
  isSyncing
}) => {
  const [localData, setLocalData] = useState<PengaturanData>(pengaturan);
  const [binSiswa, setBinSiswa] = useState({ kelas: '', nama: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync localData if parent pengaturan changes (e.g. from Cloud Load)
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
        // Reset input agar bisa pilih file lain
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalData(prev => ({ ...prev, foto: base64String }));
        showNotification("✨ Foto profil baru dipilih! Klik SIMPAN untuk mempermanenkan.");
        // Reset value input agar event change bisa dipicu lagi untuk file yang sama jika perlu
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.onerror = () => {
        showNotification("❌ Gagal membaca file gambar.");
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

  const availableStudents = useMemo(() => {
    return binSiswa.kelas ? (siswaData[binSiswa.kelas] || []) : [];
  }, [binSiswa.kelas, siswaData]);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <span className="bg-teal-100 p-2 rounded-xl">⚙️</span>
          PENGATURAN PROFIL & PENUGASAN
        </h2>
        {onSync && (
          <button 
            type="button"
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg disabled:opacity-50"
          >
            {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ SINKRON PROFIL</>}
          </button>
        )}
      </div>
      
      <form onSubmit={handleSave} className="space-y-10">
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase text-teal-600 tracking-[0.2em] ml-2">Foto & Identitas Guru Mata Pelajaran</h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-8 rounded-[32px] border border-gray-100">
            <div className="flex flex-col items-center gap-4">
               <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-200 relative group">
                 <img 
                  src={localData.foto} 
                  alt="Preview Profil" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';
                  }}
                 />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-white font-bold uppercase tracking-widest">Preview</span>
                 </div>
               </div>
               <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="bg-teal-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md active:scale-95"
               >
                 Ganti Foto
               </button>
               <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
               />
               <p className="text-[8px] font-bold text-gray-400 uppercase text-center">Format: JPG, PNG, WEBP<br/>Maksimal 2MB</p>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 tracking-widest">Nama Lengkap & Gelar</label>
                <input value={localData.nama} onChange={e => setLocalData({...localData, nama: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 tracking-widest">NIP Guru</label>
                <input value={localData.nip} onChange={e => setLocalData({...localData, nip: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 tracking-widest">Mata Pelajaran Utama</label>
                <input value={localData.mapel} onChange={e => setLocalData({...localData, mapel: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 tracking-widest">Unit Kerja / Sekolah</label>
                <input value={localData.namaSekolah} onChange={e => setLocalData({...localData, namaSekolah: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase text-orange-600 tracking-[0.2em] ml-2">Identitas Kepala Sekolah / Atasan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-orange-50/50 rounded-[32px] border border-orange-100">
            <div>
              <label className="block text-[10px] font-black uppercase text-orange-400 mb-2 tracking-widest">Nama Lengkap Kepsek</label>
              <input value={localData.namaKepsek} onChange={e => setLocalData({...localData, namaKepsek: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-white focus:ring-2 focus:ring-orange-300 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-orange-400 mb-2 tracking-widest">NIP Kepsek</label>
              <input value={localData.nipKepsek} onChange={e => setLocalData({...localData, nipKepsek: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-white focus:ring-2 focus:ring-orange-300 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-orange-400 mb-2 tracking-widest">Jabatan / Pangkat Kepsek</label>
              <input value={localData.jabatanKepsek} onChange={e => setLocalData({...localData, jabatanKepsek: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-white focus:ring-2 focus:ring-orange-300 outline-none" />
            </div>
          </div>
        </div>

        <section className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100">
          <h3 className="text-[11px] font-black uppercase text-blue-600 mb-4 tracking-widest">Penugasan Wali Kelas</h3>
          <div className="flex gap-2 mb-4">
            <select value="" onChange={e => addWaliKelas(e.target.value)} className="flex-grow p-4 rounded-2xl border font-bold bg-white focus:ring-2 focus:ring-blue-400 outline-none">
              <option value="">+ Tambah Kelas Binaan...</option>
              {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {(localData.waliKelas || []).map(k => (
              <span key={k} className="bg-white border-2 border-blue-100 px-4 py-2 rounded-full text-xs font-black text-blue-600 flex items-center gap-3 shadow-sm">
                {k}
                <button type="button" onClick={() => removeWaliKelas(k)} className="text-red-400 hover:text-red-600 font-bold">×</button>
              </span>
            ))}
          </div>
        </section>

        <section className="p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100">
          <h3 className="text-[11px] font-black uppercase text-indigo-600 mb-4 tracking-widest">Murid Binaan Khusus (Logbook)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div>
              <label className="text-[9px] font-black text-indigo-300 uppercase ml-2 mb-1 block">1. Pilih Kelas</label>
              <select value={binSiswa.kelas} onChange={e => setBinSiswa({...binSiswa, kelas: e.target.value})} className="w-full p-4 rounded-2xl border font-bold bg-white focus:ring-2 focus:ring-indigo-400 outline-none">
                <option value="">Pilih Kelas...</option>
                {(localData.waliKelas || []).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-indigo-300 uppercase ml-2 mb-1 block">2. Pilih Nama Murid</label>
              <select value={binSiswa.nama} onChange={e => setBinSiswa({...binSiswa, nama: e.target.value})} className="w-full p-4 rounded-2xl border font-bold bg-white focus:ring-2 focus:ring-indigo-400 outline-none" disabled={!binSiswa.kelas}>
                <option value="">Pilih Nama...</option>
                {availableStudents.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button type="button" onClick={addSiswaBinaan} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">TAMBAH KE DAFTAR BINAAN</button>
          <div className="mt-6 flex flex-wrap gap-2">
            {(localData.siswaBinaan || []).map((s, idx) => (
              <span key={`${s.kelas}-${s.nama}`} className="bg-white border-2 border-indigo-100 px-4 py-2 rounded-xl text-[10px] font-black text-indigo-600 flex items-center gap-3">
                {s.nama} ({s.kelas})
                <button type="button" onClick={() => removeSiswaBinaan(idx)} className="text-red-400 font-bold leading-none">×</button>
              </span>
            ))}
          </div>
        </section>

        <button type="submit" className="w-full bg-teal-600 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 hover:bg-teal-700 transition-all">
          💾 SIMPAN SELURUH PENGATURAN KE PERANGKAT
        </button>
      </form>
    </div>
  );
};

export default PengaturanTab;
