
import React, { useState, useMemo } from 'react';

interface SiswaTabProps {
  siswaData: Record<string, string[]>;
  setSiswaData: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  kelasData: string[];
  showNotification: (msg: string) => void;
  forceLoadDefault?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const SiswaTab: React.FC<SiswaTabProps> = ({ 
  siswaData, 
  setSiswaData, 
  kelasData, 
  showNotification,
  forceLoadDefault,
  onSync,
  isSyncing
}) => {
  const [newSiswa, setNewSiswa] = useState({ nama: '', kelas: '' });
  const [filter, setFilter] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const namaBersih = newSiswa.nama.trim();
    if (!namaBersih || !newSiswa.kelas) return;
    setSiswaData(prev => ({
      ...prev,
      [newSiswa.kelas]: [...(prev[newSiswa.kelas] || []), namaBersih].sort()
    }));
    showNotification(`✅ ${namaBersih} ditambahkan ke ${newSiswa.kelas}`);
    setNewSiswa({ nama: '', kelas: newSiswa.kelas });
  };

  const removeSiswa = (kelas: string, nama: string) => {
    if (window.confirm(`Hapus murid ${nama}?`)) {
      setSiswaData(prev => ({ ...prev, [kelas]: (prev[kelas] || []).filter(n => n !== nama) }));
      showNotification("🗑️ Murid dihapus.");
    }
  };

  const classesToShow = useMemo(() => filter ? [filter] : [...kelasData].sort(), [filter, kelasData]);

  return (
    <div className="bg-white rounded-[32px] shadow-xl p-10 border border-gray-100">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-teal-600 text-white p-3 rounded-2xl text-2xl">👥</span>
          DATA MURID
        </h2>
        {onSync && (
          <button 
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg disabled:opacity-50"
          >
            {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ SINKRON MURID</>}
          </button>
        )}
      </div>
      
      <form onSubmit={handleAdd} className="bg-teal-50 p-8 rounded-[32px] mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 border border-teal-100">
        <input placeholder="Nama Murid..." value={newSiswa.nama} onChange={e => setNewSiswa({...newSiswa, nama: e.target.value})} className="p-4 rounded-2xl font-bold outline-none shadow-sm focus:ring-2 focus:ring-teal-400" required />
        <select value={newSiswa.kelas} onChange={e => setNewSiswa({...newSiswa, kelas: e.target.value})} className="p-4 rounded-2xl font-black uppercase text-xs shadow-sm outline-none focus:ring-2 focus:ring-teal-400" required>
          <option value="">-- Pilih Kelas --</option>
          {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-teal-700 transition-all active:scale-95">TAMBAH MURID</button>
      </form>

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-2">Filter Tampilan Per Kelas</label>
           <select value={filter} onChange={e => setFilter(e.target.value)} className="w-full p-4 rounded-2xl font-black text-xs uppercase outline-none shadow-sm">
             <option value="">TAMPILKAN SEMUA KELAS</option>
             {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
           </select>
        </div>

        {classesToShow.map(k => (
          <div key={k} className="border-2 border-gray-50 p-8 rounded-[40px] bg-white shadow-sm hover:border-teal-100 transition-all">
            <h4 className="font-black text-gray-800 text-xl mb-6 flex justify-between items-center">
              <span>KELAS {k}</span>
              <span className="bg-gray-100 text-[10px] px-3 py-1 rounded-full text-gray-400">{siswaData[k]?.length || 0} Murid</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {(siswaData[k] || []).map(s => (
                <div key={s} className="bg-gray-50 border p-3 px-5 rounded-2xl flex items-center gap-4 group hover:bg-teal-50 hover:border-teal-300 transition-all">
                  <span className="text-[11px] font-black uppercase tracking-tight text-gray-700">{s}</span>
                  <button onClick={() => removeSiswa(k, s)} className="text-red-400 font-bold opacity-0 group-hover:opacity-100 transition hover:text-red-600">×</button>
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
