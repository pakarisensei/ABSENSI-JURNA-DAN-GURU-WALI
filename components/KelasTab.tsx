
import React, { useState } from 'react';

interface KelasTabProps {
  kelasData: string[];
  setKelasData: React.Dispatch<React.SetStateAction<string[]>>;
  jamData: string[];
  setJamData: React.Dispatch<React.SetStateAction<string[]>>;
  showNotification: (msg: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const KelasTab: React.FC<KelasTabProps> = ({ 
  kelasData, 
  setKelasData, 
  jamData, 
  setJamData, 
  showNotification,
  onSync,
  isSyncing
}) => {
  const [newKelas, setNewKelas] = useState('');
  const [newJam, setNewJam] = useState('');

  const handleAddKelas = (e: React.FormEvent) => {
    e.preventDefault();
    const bersih = newKelas.trim().toUpperCase();
    if (!bersih || kelasData.includes(bersih)) return;
    setKelasData([...kelasData, bersih].sort());
    setNewKelas('');
  };

  const handleAddJam = (e: React.FormEvent) => {
    e.preventDefault();
    const bersih = newJam.trim();
    if (!bersih || jamData.includes(bersih)) return;
    setJamData([...jamData, bersih].sort((a,b) => a.localeCompare(b, undefined, {numeric: true})));
    setNewJam('');
  };

  const removeKelas = (l: string) => {
    if (window.confirm(`Hapus ${l}?`)) setKelasData(prev => prev.filter(k => k !== l));
  };

  const removeJam = (l: string) => {
    if (window.confirm(`Hapus Jam ${l}?`)) setJamData(prev => prev.filter(j => j !== l));
  };

  return (
    <div className="bg-white rounded-[32px] shadow-xl p-10 border border-gray-100">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-teal-600 text-white p-3 rounded-2xl text-2xl">🏫</span>
          KELOLA KELAS & JAM
        </h2>
        {onSync && (
          <button 
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg disabled:opacity-50"
          >
            {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ SINKRON STRUKTUR</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xs font-black text-teal-600 uppercase tracking-widest">Daftar Kelas</h3>
          <form onSubmit={handleAddKelas} className="flex gap-2">
            <input placeholder="XII AP 1" value={newKelas} onChange={e => setNewKelas(e.target.value)} className="flex-grow p-4 bg-gray-50 rounded-2xl font-bold uppercase" />
            <button type="submit" className="bg-teal-600 text-white px-8 rounded-2xl font-black text-xl shadow-lg hover:bg-teal-700">+</button>
          </form>
          <div className="bg-gray-50 p-4 rounded-3xl min-h-[400px] space-y-2">
            {kelasData.map(k => (
              <div key={k} className="flex justify-between items-center bg-white p-4 rounded-2xl border">
                <span className="font-black text-xs uppercase">{k}</span>
                <button onClick={() => removeKelas(k)} className="text-red-500 font-bold">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black text-cyan-600 uppercase tracking-widest">Daftar Jam</h3>
          <form onSubmit={handleAddJam} className="flex gap-2">
            <input placeholder="1-2" value={newJam} onChange={e => setNewJam(e.target.value)} className="flex-grow p-4 bg-gray-50 rounded-2xl font-bold" />
            <button type="submit" className="bg-cyan-600 text-white px-8 rounded-2xl font-black text-xl shadow-lg hover:bg-cyan-700">+</button>
          </form>
          <div className="bg-gray-50 p-4 rounded-3xl min-h-[400px] space-y-2">
            {jamData.map(j => (
              <div key={j} className="flex justify-between items-center bg-white p-4 rounded-2xl border">
                <span className="font-black text-xs uppercase">JAM {j}</span>
                <button onClick={() => removeJam(j)} className="text-red-500 font-bold">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KelasTab;
