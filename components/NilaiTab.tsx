
import React, { useState, useMemo, useEffect } from 'react';
import { NilaiData, GradeRecord } from '../types';

interface NilaiTabProps {
  nilaiData: NilaiData;
  setNilaiData: React.Dispatch<React.SetStateAction<NilaiData>>;
  kelasData: string[];
  siswaData: Record<string, string[]>;
  showNotification: (msg: string) => void;
}

const NilaiTab: React.FC<NilaiTabProps> = ({
  nilaiData,
  setNilaiData,
  kelasData,
  siswaData,
  showNotification
}) => {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [localGrades, setLocalGrades] = useState<Record<string, GradeRecord>>({});

  useEffect(() => {
    if (selectedKelas) {
      const current = nilaiData[selectedKelas] || {};
      const muridList = siswaData[selectedKelas] || [];
      const updated: Record<string, GradeRecord> = {};
      
      muridList.forEach(m => {
        updated[m] = current[m] || {
          tp_m1_1: '', tp_m1_2: '', tp_m1_3: '',
          tp_m2_1: '', tp_m2_2: '', tp_m2_3: '',
          tp_m3_1: '', tp_m3_2: '', tp_m3_3: '',
          lm1: '', lm2: '', lm3: '',
          akse: '', nilRap: ''
        };
      });
      setLocalGrades(updated);
    }
  }, [selectedKelas, nilaiData, siswaData]);

  const calculateNilRap = (g: GradeRecord) => {
    const vals = [
      g.tp_m1_1, g.tp_m1_2, g.tp_m1_3, 
      g.tp_m2_1, g.tp_m2_2, g.tp_m2_3, 
      g.tp_m3_1, g.tp_m3_2, g.tp_m3_3,
      g.lm1, g.lm2, g.lm3, g.akse
    ].map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    if (vals.length === 0) return '';
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg).toString();
  };

  const handleInputChange = (murid: string, field: keyof GradeRecord, value: string) => {
    setLocalGrades(prev => {
      const updatedMurid = { ...prev[murid], [field]: value };
      updatedMurid.nilRap = calculateNilRap(updatedMurid);
      return { ...prev, [murid]: updatedMurid };
    });
  };

  const saveGrades = () => {
    setNilaiData(prev => ({
      ...prev,
      [selectedKelas]: localGrades
    }));
    showNotification("✅ Daftar nilai berhasil disimpan ke perangkat!");
  };

  const muridList = useMemo(() => {
    return (siswaData[selectedKelas] || []).sort();
  }, [siswaData, selectedKelas]);

  return (
    <div className="bg-white rounded-[40px] shadow-sm p-8 border border-gray-50 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-pink-100 p-3 rounded-2xl text-xl">📝</span>
          DAFTAR NILAI KURIKULUM MERDEKA
        </h2>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={selectedKelas} 
            onChange={(e) => setSelectedKelas(e.target.value)} 
            className="flex-grow md:w-64 p-4 rounded-2xl bg-gray-50 font-black text-xs uppercase shadow-inner outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">-- PILIH KELAS --</option>
            {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          {selectedKelas && (
            <button 
              onClick={saveGrades} 
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-lg transition-all active:scale-95"
            >
              💾 SIMPAN NILAI
            </button>
          )}
        </div>
      </div>

      {!selectedKelas ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed text-gray-300 font-black text-[11px] uppercase tracking-[0.2em]">
          Silakan pilih kelas untuk menginput nilai
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[32px] border border-gray-100">
          <table className="w-full text-center border-collapse text-[10px]">
            <thead>
              {/* Row 1: Headers Utama */}
              <tr className="bg-gray-100 font-black uppercase text-gray-600">
                <th rowSpan={3} className="border p-4 w-12 bg-gray-200">NO</th>
                <th rowSpan={3} className="border p-4 min-w-[180px] text-left bg-orange-100">NAMA SISWA</th>
                <th colSpan={9} className="border p-3 bg-purple-200 text-purple-900">ASESMEN FORMATIF</th>
                <th colSpan={4} className="border p-3 bg-blue-200 text-blue-900">ASESMEN SUMATIF</th>
                <th rowSpan={3} className="border p-4 w-20 bg-red-400 text-white">NIL RAP</th>
              </tr>
              {/* Row 2: Sub-Headers (Materi) */}
              <tr className="font-black text-[9px]">
                <th colSpan={3} className="border p-2 bg-cyan-100 text-cyan-800">MATERI 1</th>
                <th colSpan={3} className="border p-2 bg-purple-100 text-purple-800">MATERI 2</th>
                <th colSpan={3} className="border p-2 bg-emerald-100 text-emerald-800">MATERI 3</th>
                <th colSpan={3} className="border p-2 bg-pink-100 text-pink-800">AKH MATERI</th>
                <th rowSpan={2} className="border p-2 bg-cyan-200 text-cyan-900">AK SE</th>
              </tr>
              {/* Row 3: TP / LM / AK */}
              <tr className="bg-white font-bold text-[8px]">
                {/* MATERI 1 */}
                <th className="border p-2 bg-cyan-50">TP1</th><th className="border p-2 bg-cyan-50">TP2</th><th className="border p-2 bg-cyan-50">TP3</th>
                {/* MATERI 2 */}
                <th className="border p-2 bg-purple-50">TP1</th><th className="border p-2 bg-purple-50">TP2</th><th className="border p-2 bg-purple-50">TP3</th>
                {/* MATERI 3 */}
                <th className="border p-2 bg-emerald-50">TP1</th><th className="border p-2 bg-emerald-50">TP2</th><th className="border p-2 bg-emerald-50">TP3</th>
                {/* AKH MATERI */}
                <th className="border p-2 bg-pink-50">LM1</th><th className="border p-2 bg-pink-50">LM2</th><th className="border p-2 bg-pink-50">LM3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {muridList.map((murid, idx) => (
                <tr key={murid} className="hover:bg-gray-50 transition-colors">
                  <td className="border p-2 font-bold text-gray-400">{idx + 1}</td>
                  <td className="border p-2 text-left font-black text-gray-700 uppercase">{murid}</td>
                  {/* Formatif - M1 */}
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m1_1 || ''} onChange={e => handleInputChange(murid, 'tp_m1_1', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m1_2 || ''} onChange={e => handleInputChange(murid, 'tp_m1_2', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m1_3 || ''} onChange={e => handleInputChange(murid, 'tp_m1_3', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  {/* Formatif - M2 */}
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m2_1 || ''} onChange={e => handleInputChange(murid, 'tp_m2_1', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m2_2 || ''} onChange={e => handleInputChange(murid, 'tp_m2_2', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m2_3 || ''} onChange={e => handleInputChange(murid, 'tp_m2_3', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  {/* Formatif - M3 */}
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m3_1 || ''} onChange={e => handleInputChange(murid, 'tp_m3_1', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m3_2 || ''} onChange={e => handleInputChange(murid, 'tp_m3_2', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.tp_m3_3 || ''} onChange={e => handleInputChange(murid, 'tp_m3_3', e.target.value)} className="w-10 text-center outline-none bg-transparent" /></td>
                  {/* Sumatif - LM */}
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.lm1 || ''} onChange={e => handleInputChange(murid, 'lm1', e.target.value)} className="w-10 text-center outline-none bg-transparent font-bold text-blue-600" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.lm2 || ''} onChange={e => handleInputChange(murid, 'lm2', e.target.value)} className="w-10 text-center outline-none bg-transparent font-bold text-blue-600" /></td>
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.lm3 || ''} onChange={e => handleInputChange(murid, 'lm3', e.target.value)} className="w-10 text-center outline-none bg-transparent font-bold text-blue-600" /></td>
                  {/* Sumatif - AKSE */}
                  <td className="border p-1"><input type="number" value={localGrades[murid]?.akse || ''} onChange={e => handleInputChange(murid, 'akse', e.target.value)} className="w-10 text-center outline-none bg-transparent font-bold text-purple-600" /></td>
                  {/* NIL RAP */}
                  <td className="border p-2 bg-red-50 font-black text-red-600">{localGrades[murid]?.nilRap || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NilaiTab;
