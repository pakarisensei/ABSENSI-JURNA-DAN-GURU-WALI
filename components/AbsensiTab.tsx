
import React, { useState } from 'react';
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

  const handleLoad = () => {
    if (!params.kelas) {
      showNotification("Pilih kelas terlebih dahulu!");
      return;
    }
    const current = (absensiData[params.tanggal] && absensiData[params.tanggal][params.kelas]) || {};
    const defaultStatuses: Record<string, 'H' | 'S' | 'I' | 'A'> = {};
    (siswaData[params.kelas] || []).forEach(s => {
      defaultStatuses[s] = current[s] || 'H';
    });
    setLocalStatuses(defaultStatuses);
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

  const siswaList = siswaData[params.kelas] || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Daftar Hadir Siswa</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
          <input type="date" value={params.tanggal} onChange={e => setParams({...params, tanggal: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
          <select value={params.kelas} onChange={e => setParams({...params, kelas: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg">
            <option value="">Pilih Kelas</option>
            {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleLoad} className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition font-bold">MUAT SISWA</button>
        </div>
      </div>

      {siswaList.length > 0 && Object.keys(localStatuses).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">No</th>
                <th className="border p-3 text-left">Nama Siswa</th>
                <th className="border p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.sort().map((siswa, idx) => (
                <tr key={siswa}>
                  <td className="border p-3 w-16">{idx + 1}</td>
                  <td className="border p-3">{siswa}</td>
                  <td className="border p-3 text-center">
                    <div className="flex justify-center space-x-1">
                      {(['H', 'S', 'I', 'A'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(siswa, s)}
                          className={`w-8 h-8 rounded-full font-bold text-xs transition ${
                            localStatuses[siswa] === s 
                            ? (s==='H'?'bg-green-500 text-white':s==='S'?'bg-orange-500 text-white':s==='I'?'bg-yellow-500 text-white':'bg-red-500 text-white')
                            : 'bg-gray-200 text-gray-600'
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
          <button onClick={handleSave} className="mt-6 w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition font-bold">
            💾 SIMPAN KEHADIRAN
          </button>
        </div>
      )}
    </div>
  );
};

export default AbsensiTab;
