
import React, { useState } from 'react';
import { PengaturanData, SiswaBinaan } from '../types';

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
  const [localData, setLocalData] = useState(pengaturan);
  const [binSiswa, setBinSiswa] = useState({ kelas: '', nama: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPengaturan(localData);
    showNotification("✅ Pengaturan profil disimpan.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Limit 1MB to keep cloud sync fast
        showNotification("❌ Ukuran foto terlalu besar (Max 1MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalData({ ...localData, foto: reader.result as string });
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
    const exists = localData.siswaBinaan.some(s => s.nama === binSiswa.nama && s.kelas === binSiswa.kelas);
    if (exists) return;
    setLocalData({ 
      ...localData, 
      siswaBinaan: [...localData.siswaBinaan, { nama: binSiswa.nama, kelas: binSiswa.kelas }] 
    });
    setBinSiswa({ kelas: '', nama: '' });
  };

  const removeSiswaBinaan = (idx: number) => {
    setLocalData({ 
      ...localData, 
      siswaBinaan: localData.siswaBinaan.filter((_, i) => i !== idx) 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Pengaturan Profil</h2>
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Bagian Foto Profil */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={localData.foto} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-xs opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
              Ganti Foto
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <div className="flex-grow text-center md:text-left">
            <h4 className="font-bold text-gray-700">Foto Profil</h4>
            <p className="text-xs text-gray-500 mb-3">Klik pada gambar atau tombol di bawah untuk mengganti foto (Rekomendasi: Persegi, Max 1MB)</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nama Guru</label>
            <input value={localData.nama} onChange={e => setLocalData({...localData, nama: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">NIP</label>
            <input value={localData.nip} onChange={e => setLocalData({...localData, nip: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Nama Sekolah</label>
          <input value={localData.namaSekolah} onChange={e => setLocalData({...localData, namaSekolah: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold mb-2 text-gray-800">Penugasan Wali Kelas</h3>
          <div className="flex gap-2 mb-2">
            <select onChange={e => addWaliKelas(e.target.value)} className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="">Pilih Kelas untuk Dibina</option>
              {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {localData.waliKelas.map(k => (
              <span key={k} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-200">
                {k} <button type="button" onClick={() => removeWaliKelas(k)} className="font-bold hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold mb-2 text-gray-800">Siswa Binaan (Khusus Guru Wali)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <select value={binSiswa.kelas} onChange={e => setBinSiswa({...binSiswa, kelas: e.target.value, nama: ''})} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="">Pilih Kelas</option>
              {localData.waliKelas.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select value={binSiswa.nama} onChange={e => setBinSiswa({...binSiswa, nama: e.target.value})} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="">Pilih Siswa</option>
              {(siswaData[binSiswa.kelas] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="button" onClick={addSiswaBinaan} className="bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition">Tambah Siswa</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localData.siswaBinaan.map((s, idx) => (
              <span key={idx} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-emerald-200">
                {s.nama} ({s.kelas}) <button type="button" onClick={() => removeSiswaBinaan(idx)} className="font-bold hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-teal-600 text-white py-4 rounded-lg font-bold shadow-lg hover:bg-teal-700 transition-all transform hover:-translate-y-1 active:scale-95">
          💾 SIMPAN SEMUA PERUBAHAN
        </button>
      </form>
    </div>
  );
};

export default PengaturanTab;
