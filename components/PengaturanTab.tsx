
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Guru</label>
            <input value={localData.nama} onChange={e => setLocalData({...localData, nama: e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NIP</label>
            <input value={localData.nip} onChange={e => setLocalData({...localData, nip: e.target.value})} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nama Sekolah</label>
          <input value={localData.namaSekolah} onChange={e => setLocalData({...localData, namaSekolah: e.target.value})} className="w-full p-2 border rounded" />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">Penugasan Wali Kelas</h3>
          <div className="flex gap-2 mb-2">
            <select onChange={e => addWaliKelas(e.target.value)} className="flex-grow p-2 border rounded">
              <option value="">Pilih Kelas untuk Dibina</option>
              {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {localData.waliKelas.map(k => (
              <span key={k} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {k} <button type="button" onClick={() => removeWaliKelas(k)} className="font-bold">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">Siswa Binaan (Khusus Guru Wali)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <select value={binSiswa.kelas} onChange={e => setBinSiswa({...binSiswa, kelas: e.target.value, nama: ''})} className="p-2 border rounded">
              <option value="">Pilih Kelas</option>
              {localData.waliKelas.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select value={binSiswa.nama} onChange={e => setBinSiswa({...binSiswa, nama: e.target.value})} className="p-2 border rounded">
              <option value="">Pilih Siswa</option>
              {(siswaData[binSiswa.kelas] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="button" onClick={addSiswaBinaan} className="bg-teal-600 text-white rounded">Tambah Siswa</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localData.siswaBinaan.map((s, idx) => (
              <span key={idx} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {s.nama} ({s.kelas}) <button type="button" onClick={() => removeSiswaBinaan(idx)} className="font-bold">×</button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold shadow-lg">SIMPAN PERUBAHAN</button>
      </form>
    </div>
  );
};

export default PengaturanTab;
