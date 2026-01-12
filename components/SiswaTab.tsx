
import React, { useState } from 'react';

interface SiswaTabProps {
  siswaData: Record<string, string[]>;
  setSiswaData: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  kelasData: string[];
  showNotification: (msg: string) => void;
}

const SiswaTab: React.FC<SiswaTabProps> = ({ 
  siswaData, 
  setSiswaData, 
  kelasData, 
  showNotification 
}) => {
  const [newSiswa, setNewSiswa] = useState({ nama: '', kelas: '' });
  const [filter, setFilter] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiswa.nama || !newSiswa.kelas) return;
    setSiswaData(prev => {
      const list = prev[newSiswa.kelas] || [];
      if (list.includes(newSiswa.nama)) {
        showNotification("Siswa sudah ada!");
        return prev;
      }
      return { ...prev, [newSiswa.kelas]: [...list, newSiswa.nama] };
    });
    setNewSiswa({ nama: '', kelas: '' });
    showNotification("Siswa ditambahkan.");
  };

  const removeSiswa = (kelas: string, nama: string) => {
    setSiswaData(prev => {
      const list = prev[kelas].filter(n => n !== nama);
      const newState = { ...prev };
      if (list.length === 0) delete newState[kelas];
      else newState[kelas] = list;
      return newState;
    });
  };

  const classesToShow = filter ? [filter] : Object.keys(siswaData).sort();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Kelola Data Siswa</h2>
      <form onSubmit={handleAdd} className="bg-teal-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input placeholder="Nama Siswa" value={newSiswa.nama} onChange={e => setNewSiswa({...newSiswa, nama: e.target.value})} className="p-3 border rounded-lg" required />
        <select value={newSiswa.kelas} onChange={e => setNewSiswa({...newSiswa, kelas: e.target.value})} className="p-3 border rounded-lg" required>
          <option value="">Pilih Kelas</option>
          {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="bg-teal-600 text-white rounded-lg font-bold">TAMBAH</button>
      </form>

      <div className="mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="w-full p-2 border rounded-lg">
          <option value="">Semua Kelas</option>
          {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {classesToShow.map(k => (
          <div key={k} className="border p-4 rounded-lg">
            <h4 className="font-bold text-gray-700 mb-2">{k} ({siswaData[k]?.length || 0} Siswa)</h4>
            <div className="flex flex-wrap gap-2">
              {(siswaData[k] || []).sort().map(s => (
                <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {s}
                  <button onClick={() => removeSiswa(k, s)} className="text-red-500 font-bold hover:scale-110">×</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiswaTab;
