
import React, { useState, useEffect } from 'react';
import { PengaturanData } from '../types';

interface PengaturanTabProps {
  pengaturan: PengaturanData;
  setPengaturan: React.Dispatch<React.SetStateAction<PengaturanData>>;
  kelasData: string[];
  siswaData: Record<string, string[]>;
  showNotification: (msg: string) => void;
}

const PengaturanTab: React.FC<PengaturanTabProps> = ({ 
  pengaturan, 
  setPengaturan, 
  kelasData, 
  siswaData, 
  showNotification 
}) => {
  // Local state untuk form
  const [localData, setLocalData] = useState(pengaturan);
  const [binSiswa, setBinSiswa] = useState({ kelas: '', nama: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // KRUSIAL: Sinkronisasi jika data pengaturan di pusat (App.tsx) berubah
  // Misalnya saat user klik "Muat Ulang" dari Cloud
  useEffect(() => {
    setLocalData(pengaturan);
  }, [pengaturan]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPengaturan(localData);
    showNotification("✅ Data berhasil disimpan ke memori aplikasi. Klik SIMPAN CLOUD untuk mencadangkan permanen.");
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setLocalData({ ...localData, foto: compressed });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addWaliKelas = (k: string) => {
    if (!k || localData.waliKelas.includes(k)) return;
    setLocalData({ ...localData, waliKelas: [...localData.waliKelas, k].sort() });
  };

  const removeWaliKelas = (k: string) => {
    setLocalData({ ...localData, waliKelas: localData.waliKelas.filter(item => item !== k) });
  };

  const addSiswaBinaan = () => {
    if (!binSiswa.nama || !binSiswa.kelas) return;
    // Cek apakah sudah ada
    const exists = localData.siswaBinaan?.some(s => s.nama === binSiswa.nama && s.kelas === binSiswa.kelas);
    if (exists) return;
    
    const newList = [...(localData.siswaBinaan || []), { nama: binSiswa.nama, kelas: binSiswa.kelas }];
    setLocalData({ 
      ...localData, 
      siswaBinaan: newList 
    });
    setBinSiswa({ kelas: '', nama: '' });
  };

  const removeSiswaBinaan = (idx: number) => {
    const newList = localData.siswaBinaan.filter((_, i) => i !== idx);
    setLocalData({ ...localData, siswaBinaan: newList });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span className="bg-teal-100 p-2 rounded-xl">⚙️</span>
        Pengaturan Profil & Administrasi
      </h2>
      
      <form onSubmit={handleSave} className="space-y-8">
        {/* DATA GURU */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest border-b pb-2">Identitas Guru Mata Pelajaran</h3>
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ${isProcessing ? 'opacity-50' : ''}`}>
                <img src={localData.foto} alt="Preview" className="w-full h-full object-cover" />
                {isProcessing && <div className="absolute inset-0 flex items-center justify-center"><div className="loader !border-teal-600" /></div>}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity font-bold text-[10px] text-center uppercase">
                Ganti<br/>Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Lengkap Guru</label>
                <input value={localData.nama} onChange={e => setLocalData({...localData, nama: e.target.value})} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NIP Guru</label>
                <input value={localData.nip} onChange={e => setLocalData({...localData, nip: e.target.value})} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mata Pelajaran</label>
                <input value={localData.mapel} onChange={e => setLocalData({...localData, mapel: e.target.value})} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Sekolah</label>
                <input value={localData.namaSekolah} onChange={e => setLocalData({...localData, namaSekolah: e.target.value})} className="w-full p-3 border rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* DATA KEPALA SEKOLAH */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">Data Penandatangan (Kepala Sekolah)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-50">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Lengkap Kepala Sekolah</label>
              <input value={localData.namaKepsek} onChange={e => setLocalData({...localData, namaKepsek: e.target.value})} className="w-full p-3 border rounded-xl bg-white" placeholder="Andi Aminah, S.Pd.,Gr" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NIP Kepala Sekolah</label>
              <input value={localData.nipKepsek} onChange={e => setLocalData({...localData, nipKepsek: e.target.value})} className="w-full p-3 border rounded-xl bg-white" placeholder="197010092006042002" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jabatan Penandatangan</label>
              <input value={localData.jabatanKepsek} onChange={e => setLocalData({...localData, jabatanKepsek: e.target.value})} className="w-full p-3 border rounded-xl bg-white" placeholder="Plt. Kepala UPT SMKN 4 Sinjai" />
            </div>
          </div>
        </section>

        {/* WALIKELAS & MURID BINAAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest border-b pb-2">Penugasan Wali Kelas</h3>
            <select onChange={e => addWaliKelas(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500">
              <option value="">Tambah Kelas Binaan...</option>
              {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="flex flex-wrap gap-2">
              {localData.waliKelas.map(k => (
                <span key={k} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-2">
                  {k} <button type="button" onClick={() => removeWaliKelas(k)} className="hover:text-red-500 text-lg">×</button>
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b pb-2">Murid Binaan (Pendampingan Wali)</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex gap-2">
                <select value={binSiswa.kelas} onChange={e => setBinSiswa({...binSiswa, kelas: e.target.value})} className="flex-1 p-3 border rounded-xl text-xs">
                  <option value="">Pilih Kelas</option>
                  {localData.waliKelas.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={binSiswa.nama} onChange={e => setBinSiswa({...binSiswa, nama: e.target.value})} className="flex-1 p-3 border rounded-xl text-xs">
                  <option value="">Pilih Murid</option>
                  {(siswaData[binSiswa.kelas] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" onClick={addSiswaBinaan} className="bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition px-4 py-3 text-[10px] uppercase tracking-widest">TAMBAH</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 border border-dashed rounded-xl border-indigo-100">
              {(localData.siswaBinaan || []).map((s, idx) => (
                <span key={idx} className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-bold border border-emerald-100 flex items-center gap-2">
                  {s.nama} ({s.kelas}) <button type="button" onClick={() => removeSiswaBinaan(idx)} className="hover:text-red-500 text-lg font-black">×</button>
                </span>
              ))}
              {(localData.siswaBinaan || []).length === 0 && <p className="text-[10px] text-gray-300 italic">Belum ada murid binaan terpilih.</p>}
            </div>
          </section>
        </div>

        <button type="submit" className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-teal-700 transition-all uppercase text-xs tracking-widest active:scale-95">
          💾 SIMPAN PERUBAHAN PROFIL & MURID BINAAN
        </button>
      </form>
    </div>
  );
};

export default PengaturanTab;
