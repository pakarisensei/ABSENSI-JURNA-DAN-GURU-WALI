
import React, { useState, useMemo, useEffect } from 'react';
import { AbsensiData } from '../types';
import { formatHariTanggal } from '../utils';

interface AbsensiTabProps {
  absensiData: AbsensiData;
  setAbsensiData: React.Dispatch<React.SetStateAction<AbsensiData>>;
  kelasData: string[];
  siswaData: Record<string, string[]>;
  showNotification: (msg: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const AbsensiTab: React.FC<AbsensiTabProps> = ({ 
  absensiData, 
  setAbsensiData, 
  kelasData, 
  siswaData, 
  showNotification,
  onSync,
  isSyncing
}) => {
  const [params, setParams] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kelas: ''
  });
  const [localStatuses, setLocalStatuses] = useState<Record<string, 'H' | 'S' | 'I' | 'A'>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // BUG FIX: Auto-load data jika tanggal atau kelas berubah
  useEffect(() => {
    if (params.kelas) {
      handleLoad();
    } else {
      setIsLoaded(false);
    }
  }, [params.tanggal, params.kelas]);

  const handleLoad = () => {
    if (!params.kelas) return;
    const muridList = siswaData[params.kelas] || [];
    const current = absensiData[params.tanggal]?.[params.kelas] || {};
    const defaultStatuses: Record<string, 'H' | 'S' | 'I' | 'A'> = {};
    muridList.forEach(s => { defaultStatuses[s] = current[s] || 'H'; });
    setLocalStatuses(defaultStatuses);
    setIsLoaded(true);
  };

  const updateStatus = (siswa: string, status: 'H' | 'S' | 'I' | 'A') => {
    setLocalStatuses(prev => ({ ...prev, [siswa]: status }));
  };

  const handleSave = () => {
    setAbsensiData(prev => ({
      ...prev,
      [params.tanggal]: { ...(prev[params.tanggal] || {}), [params.kelas]: localStatuses }
    }));
    showNotification("✅ Absensi disimpan ke memori HP!");
  };

  const muridList = useMemo(() => {
    return (siswaData[params.kelas] || []).sort((a, b) => a.localeCompare(b));
  }, [siswaData, params.kelas]);

  const absensiHistory = useMemo(() => {
    const list: { tanggal: string; kelas: string; rekap: string }[] = [];
    Object.entries(absensiData).sort((a, b) => b[0].localeCompare(a[0])).forEach(([tgl, dataKelas]) => {
      Object.entries(dataKelas).forEach(([kls, muridData]) => {
        let h=0, s=0, i=0, a=0;
        Object.values(muridData).forEach(st => {
          if (st === 'H') h++; else if (st === 'S') s++; else if (st === 'I') i++; else if (st === 'A') a++;
        });
        list.push({ 
          tanggal: tgl, 
          kelas: kls, 
          rekap: `H:${h} S:${s} I:${i} A:${a}` 
        });
      });
    });
    return list;
  }, [absensiData]);

  const deleteAbsensi = (tanggal: string, kelas: string) => {
    if (window.confirm(`Hapus data absensi ${kelas} tanggal ${tanggal}?`)) {
      setAbsensiData(prev => {
        const newData = { ...prev };
        if (newData[tanggal]) {
          delete newData[tanggal][kelas];
          if (Object.keys(newData[tanggal]).length === 0) delete newData[tanggal];
        }
        return newData;
      });
      showNotification("🗑️ Absensi dihapus.");
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-50">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-emerald-100 p-3 rounded-2xl text-2xl">✅</span>
          PRESENSI MURID
        </h2>
        {onSync && (
          <button 
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 shadow-lg disabled:opacity-50"
          >
            {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ SINKRON ABSENSI</>}
          </button>
        )}
      </div>

      <div className="bg-emerald-50/50 p-8 rounded-[40px] border border-emerald-100 mb-12 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-emerald-600 uppercase ml-2 tracking-widest">Pilih Tanggal</label>
            <input type="date" value={params.tanggal} onChange={e => setParams({...params, tanggal: e.target.value})} className="w-full p-4 border-none bg-white rounded-2xl shadow-sm font-bold outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-emerald-600 uppercase ml-2 tracking-widest">Pilih Kelas</label>
            <select value={params.kelas} onChange={e => setParams({...params, kelas: e.target.value})} className="w-full p-4 border-none bg-white rounded-2xl shadow-sm font-black text-xs uppercase outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">-- PILIH KELAS --</option>
              {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoaded && muridList.length > 0 ? (
        <div className="animate-fade-in space-y-8">
          <div className="overflow-hidden border border-gray-100 rounded-[32px] bg-white shadow-sm overflow-x-auto">
            <table className="w-full border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                  <th className="p-6 text-left border-b w-1/2">Nama Murid</th>
                  <th className="p-6 border-b">H / S / I / A</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {muridList.map((murid) => (
                  <tr key={murid} className="hover:bg-gray-50/30 transition">
                    <td className="p-6 text-sm font-bold text-gray-700">{murid}</td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        {(['H', 'S', 'I', 'A'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(murid, s)}
                            className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all shadow-sm ${
                              localStatuses[murid] === s 
                              ? (s==='H'?'bg-emerald-500 text-white ring-4 ring-emerald-50':s==='S'?'bg-blue-500 text-white ring-4 ring-blue-50':s==='I'?'bg-orange-500 text-white ring-4 ring-orange-50':'bg-red-500 text-white ring-4 ring-red-50')
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
          </div>
          <button onClick={handleSave} className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 hover:bg-black transition-all">
            💾 SIMPAN KEHADIRAN KE PERANGKAT
          </button>
        </div>
      ) : isLoaded ? (
        <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest italic">Belum ada data murid di kelas ini</p>
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest italic">Pilih kelas untuk memulai absensi</p>
        </div>
      )}

      <div className="mt-16 space-y-6">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Riwayat Rekap Presensi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {absensiHistory.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all">
              <div>
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{formatHariTanggal(item.tanggal)}</p>
                 <h5 className="font-black text-gray-800 text-sm mt-1 uppercase">Kelas {item.kelas}</h5>
                 <p className="text-[10px] font-bold text-gray-400 mt-1 bg-gray-50 px-3 py-1 rounded-full inline-block font-mono">{item.rekap}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setParams({tanggal: item.tanggal, kelas: item.kelas}); }} className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">✏️</button>
                <button onClick={() => deleteAbsensi(item.tanggal, item.kelas)} className="p-2.5 bg-gray-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AbsensiTab;
