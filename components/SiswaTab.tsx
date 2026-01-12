
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
  const [editingSiswa, setEditingSiswa] = useState<{ kelas: string, oldNama: string, newNama: string } | null>(null);

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
    if (confirm(`Hapus siswa ${nama}?`)) {
      setSiswaData(prev => {
        const list = prev[kelas].filter(n => n !== nama);
        const newState = { ...prev };
        if (list.length === 0) delete newState[kelas];
        else newState[kelas] = list;
        return newState;
      });
    }
  };

  const handleUpdateSiswa = () => {
    if (!editingSiswa || !editingSiswa.newNama.trim()) return;
    
    setSiswaData(prev => {
      const list = prev[editingSiswa.kelas] || [];
      const updatedList = list.map(n => n === editingSiswa.oldNama ? editingSiswa.newNama : n);
      return { ...prev, [editingSiswa.kelas]: updatedList };
    });
    
    showNotification("Nama siswa diperbarui.");
    setEditingSiswa(null);
  };

  const classesToShow = filter ? [filter] : Object.keys(siswaData).sort();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Kelola Data Siswa</h2>
      
      {/* Form Tambah */}
      <form onSubmit={handleAdd} className="bg-teal-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-teal-100">
        <input placeholder="Nama Siswa Baru" value={newSiswa.nama} onChange={e => setNewSiswa({...newSiswa, nama: e.target.value})} className="p-3 border rounded-lg focus:ring-2 focus:ring-teal-500" required />
        <select value={newSiswa.kelas} onChange={e => setNewSiswa({...newSiswa, kelas: e.target.value})} className="p-3 border rounded-lg focus:ring-2 focus:ring-teal-500" required>
          <option value="">Pilih Kelas</option>
          {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition">TAMBAH</button>
      </form>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Kelas</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50">
          <option value="">Semua Kelas</option>
          {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {classesToShow.map(k => (
          <div key={k} className="border p-4 rounded-lg bg-white shadow-sm">
            <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
              🏫 {k} <span className="text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full">{siswaData[k]?.length || 0} Siswa</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {(siswaData[k] || []).sort().map(s => (
                <div key={s} className="group relative">
                  {editingSiswa?.oldNama === s && editingSiswa?.kelas === k ? (
                    <div className="flex items-center gap-1 bg-white border border-blue-400 p-1 rounded-lg shadow-sm">
                      <input 
                        autoFocus
                        value={editingSiswa.newNama}
                        onChange={e => setEditingSiswa({...editingSiswa, newNama: e.target.value})}
                        className="text-xs p-1 border-none focus:ring-0 w-24"
                      />
                      <button onClick={handleUpdateSiswa} className="text-green-600 text-xs font-bold">✓</button>
                      <button onClick={() => setEditingSiswa(null)} className="text-red-600 text-xs font-bold">×</button>
                    </div>
                  ) : (
                    <span className="bg-gray-100 hover:bg-teal-50 border border-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-all">
                      {s}
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingSiswa({ kelas: k, oldNama: s, newNama: s })} 
                          className="text-blue-400 hover:text-blue-600 text-[10px] transition"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => removeSiswa(k, s)} 
                          className="text-red-300 hover:text-red-500 font-bold transition"
                        >
                          ×
                        </button>
                      </div>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiswaTab;
