
import React, { useState, useMemo } from 'react';
import { AbsensiData } from '../types';

interface AbsensiTabProps {
  absensiData: AbsensiData;
  setAbsensiData: React.Dispatch<React.SetStateAction<AbsensiData>>;
  kelasData: string[];
  siswaData: Record<string, string[]>;
  showNotification: (msg: string) => void;
}

const AbsensiTab: React.FC<AbsensiTabProps> = ({ 
  absensiData, 
  setAbsensiData, 
  kelasData, 
  siswaData, 
  showNotification 
}) => {
  const [params, setParams] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kelas: ''
  });
  const [localStatuses, setLocalStatuses] = useState<Record<string, 'H' | 'S' | 'I' | 'A'>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    if (!params.kelas) {
      showNotification("Pilih kelas terlebih dahulu!");
      return;
    }
    
    const muridList = siswaData[params.kelas] || [];
    
    if (muridList.length === 0) {
      showNotification(`Belum ada data murid untuk kelas ${params.kelas}. Tambahkan di tab Murid.`);
      setLocalStatuses({});
      setIsLoaded(true);
      return;
    }

    const current = (absensiData[params.tanggal] && absensiData[params.tanggal][params.kelas]) || {};
    const defaultStatuses: Record<string, 'H' | 'S' | 'I' | 'A'> = {};
    
    muridList.forEach(s => {
      defaultStatuses[s] = current[s] || 'H';
    });
    
    setLocalStatuses(defaultStatuses);
    setIsLoaded(true);
  };

  const updateStatus = (siswa: string, status: 'H' | 'S' | 'I' | 'A') => {
    setLocalStatuses(prev => ({ ...prev, [siswa]: status }));
  };

  const handleSave = () => {
    setAbsensiData(prev => ({
      ...prev,
      [params.tanggal]: {
        ...(prev[params.tanggal] || {}),
        [params.kelas]: localStatuses
      }
    }));
    showNotification("✅ Kehadiran berhasil disimpan!");
  };

  const muridList = useMemo(() => {
    return (siswaData[params.kelas] || []).sort((a, b) => a.localeCompare(b));
  }, [siswaData, params.kelas]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Daftar Hadir Murid</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
          <input type="date" value={params.tanggal} onChange={e => { setParams({...params, tanggal: e.target.value}); setIsLoaded(false); }} className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
          <select value={params.kelas} onChange={e => { setParams({...params, kelas: e.target.value}); setIsLoaded(false); }} className="w-full p-3 border border-gray-300 rounded-lg">
            <option value="">Pilih Kelas</option>
            {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleLoad} className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition font-bold shadow-md active:scale-95 uppercase text-xs tracking-widest">MUAT MURID</button>
        </div>
      </div>

      {isLoaded && muridList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-[10px] font-black tracking-widest">
                <th className="border-b p-4 text-left w-16">No</th>
                <th className="border-b p-4 text-left">Nama Murid</th>
                <th className="border-b p-4 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {muridList.map((murid, idx) => (
                <tr key={murid} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-sm font-bold text-gray-400">{idx + 1}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{murid}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {(['H', 'S', 'I', 'A'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(murid, s)}
                          className={`w-10 h-10 rounded-xl font-black text-xs transition-all shadow-sm ${
                            localStatuses[murid] === s 
                            ? (s==='H'?'bg-green-500 text-white shadow-green-100 scale-110':s==='S'?'bg-orange-500 text-white shadow-orange-100 scale-110':s==='I'?'bg-yellow-500 text-white shadow-yellow-100 scale-110':'bg-red-500 text-white shadow-red-100 scale-110')
                            : 'bg-white text-gray-300 border border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSave} className="mt-8 w-full bg-cyan-600 text-white py-4 rounded-2xl hover:bg-cyan-700 transition font-black shadow-xl shadow-cyan-100 active:scale-95 text-xs tracking-widest uppercase">
            💾 SIMPAN KEHADIRAN KELAS {params.kelas}
          </button>
        </div>
      ) : isLoaded && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-bold">Data murid kelas {params.kelas} tidak ditemukan.</p>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-tighter">Silakan tambahkan data murid di tab Murid.</p>
        </div>
      )}
    </div>
  );
};

export default AbsensiTab;
