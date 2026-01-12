
import React, { useState } from 'react';

interface KelasTabProps {
  kelasData: string[];
  setKelasData: React.Dispatch<React.SetStateAction<string[]>>;
  jamData: string[];
  setJamData: React.Dispatch<React.SetStateAction<string[]>>;
  showNotification: (msg: string) => void;
}

const KelasTab: React.FC<KelasTabProps> = ({ 
  kelasData, 
  setKelasData, 
  jamData, 
  setJamData, 
  showNotification 
}) => {
  const [newKelas, setNewKelas] = useState('');
  const [newJam, setNewJam] = useState('');

  const addKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKelas || kelasData.includes(newKelas)) return;
    setKelasData([...kelasData, newKelas].sort());
    setNewKelas('');
  };

  const addJam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJam || jamData.includes(newJam)) return;
    setJamData([...jamData, newJam].sort());
    setNewJam('');
  };

  const removeKelas = (k: string) => setKelasData(prev => prev.filter(item => item !== k));
  const removeJam = (j: string) => setJamData(prev => prev.filter(item => item !== j));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏫 Kelola Kelas & Jam</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold mb-4">Daftar Kelas</h3>
          <form onSubmit={addKelas} className="flex gap-2 mb-4">
            <input placeholder="Contoh: XII IPA 1" value={newKelas} onChange={e => setNewKelas(e.target.value)} className="flex-grow p-2 border rounded" />
            <button className="bg-teal-600 text-white px-4 rounded">+</button>
          </form>
          <div className="space-y-2">
            {kelasData.map(k => (
              <div key={k} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                <span>{k}</span>
                <button onClick={() => removeKelas(k)} className="text-red-500">Hapus</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4">Jam Pelajaran</h3>
          <form onSubmit={addJam} className="flex gap-2 mb-4">
            <input placeholder="Contoh: 1-2" value={newJam} onChange={e => setNewJam(e.target.value)} className="flex-grow p-2 border rounded" />
            <button className="bg-cyan-600 text-white px-4 rounded">+</button>
          </form>
          <div className="space-y-2">
            {jamData.map(j => (
              <div key={j} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                <span>{j}</span>
                <button onClick={() => removeJam(j)} className="text-red-500">Hapus</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KelasTab;
