
import React, { useState } from 'react';

interface SiswaTabProps {
  siswaData: Record<string, string[]>;
  setSiswaData: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  kelasData: string[];
  showNotification: (msg: string) => void;
  forceLoadDefault?: () => void; // Menambahkan prop baru
}

const SiswaTab: React.FC<SiswaTabProps> = ({ 
  siswaData, 
  setSiswaData, 
  kelasData, 
  showNotification,
  forceLoadDefault
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
        showNotification("Murid sudah ada!");
        return prev;
      }
      return { ...prev, [newSiswa.kelas]: [...list, newSiswa.nama] };
    });
    setNewSiswa({ nama: '', kelas: '' });
    showNotification("Murid ditambahkan.");
  };

  const removeSiswa = (kelas: string, nama: string) => {
    if (confirm(`Hapus murid ${nama}?`)) {
      setSiswaData(prev => {
        const list = prev[kelas].filter(n => n !== nama);
        const newState = { ...prev };
        if (list.length === 0) delete newState[kelas];
        else newState[kelas] = list;
        return newState;
      });
      showNotification("✅ Murid telah dihapus.");
    }
  };

  const handleUpdateSiswa = () => {
    if (!editingSiswa || !editingSiswa.newNama.trim()) return;
    
    setSiswaData(prev => {
      const list = prev[editingSiswa.kelas] || [];
      const updatedList = list.map(n => n === editingSiswa.oldNama ? editingSiswa.newNama : n);
      return { ...prev, [editingSiswa.kelas]: updatedList };
    });
    
    showNotification("Nama murid diperbarui.");
    setEditingSiswa(null);
  };

  const classesToShow = filter ? [filter] : Object.keys(siswaData).sort();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Kelola Data Murid</h2>
      
      <form onSubmit={handleAdd} className="bg-teal-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-teal-100">
        <input placeholder="Nama Murid Baru" value={newSiswa.nama} onChange={e => setNewSiswa({...newSiswa, nama: e.target.value})} className="p-3 border rounded-lg focus:ring-2 focus:ring-teal-500" required />
        <select value={newSiswa.kelas} onChange={e => setNewSiswa({...newSiswa, kelas: e.target.value})} className="p-3 border rounded-lg focus:ring-2 focus:ring-teal-500" required>
          <option value="">Pilih Kelas</option>
          {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition uppercase text-xs tracking-widest">TAMBAH</button>
      </form>

      <div className="mb-6">
        <label className="block text-sm font-black text-gray-400 mb-1 uppercase tracking-widest text-[10px]">Filter Kelas</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50 font-bold text-gray-700">
          <option value="">Semua Kelas</option>
          {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="space-y-4 min-h-[300px]">
        {classesToShow.length > 0 ? (
          classesToShow.map(k => (
            <div key={k} className="border p-4 rounded-2xl bg-white shadow-sm border-gray-100">
              <h4 className="font-black text-teal-800 mb-3 flex items-center justify-between text-sm uppercase tracking-tight">
                <span>🏫 Kelas {k}</span>
                <span className="text-[10px] bg-teal-100 text-teal-600 px-3 py-1 rounded-full">{siswaData[k]?.length || 0} Murid</span>
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
                        <button onClick={handleUpdateSiswa} className="text-green-600 text-xs font-bold px-1">✓</button>
                        <button onClick={() => setEditingSiswa(null)} className="text-red-600 text-xs font-bold px-1">×</button>
                      </div>
                    ) : (
                      <span className="bg-gray-100 hover:bg-teal-50 border border-gray-200 px-4 py-1.5 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-3 transition-all">
                        {s}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingSiswa({ kelas: k, oldNama: s, newNama: s })} 
                            className="text-blue-400 hover:text-blue-600 transition"
                            title="Edit Nama"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => removeSiswa(k, s)} 
                            className="text-red-300 hover:text-red-500 font-bold transition"
                            title="Hapus Murid"
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
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data murid.</p>
          </div>
        )}
      </div>

      {/* Tombol Recovery untuk Bapak */}
      {forceLoadDefault && (
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-4">Butuh Memulihkan Data Murid AP Bapak?</p>
          <button 
            onClick={() => {
              if(confirm("Tindakan ini akan menimpa data murid saat ini dengan data Kelas X AP 1, X AP 2, XI AP 1, dan XI AP 2 yang Bapak berikan. Lanjutkan?")) {
                forceLoadDefault();
              }
            }}
            className="text-[10px] font-black tracking-widest uppercase border-2 border-orange-200 text-orange-500 px-6 py-3 rounded-2xl hover:bg-orange-50 transition active:scale-95"
          >
            📥 Impor Ulang Data Murid AP
          </button>
        </div>
      )}
    </div>
  );
};

export default SiswaTab;
