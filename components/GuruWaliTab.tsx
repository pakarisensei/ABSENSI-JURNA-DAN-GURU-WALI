
import React, { useState, useEffect } from 'react';
import { PengaturanData, WaliRecord } from '../types';
import { getWeekNumber } from '../utils';

interface GuruWaliTabProps {
  pengaturan: PengaturanData;
  waliData: WaliRecord[];
  setWaliData: React.Dispatch<React.SetStateAction<WaliRecord[]>>;
  showNotification: (msg: string) => void;
}

const GuruWaliTab: React.FC<GuruWaliTabProps> = ({ 
  pengaturan, 
  waliData, 
  setWaliData, 
  showNotification 
}) => {
  const [selection, setSelection] = useState({
    kelas: '',
    siswa: ''
  });
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    hadir: '0',
    sakit: '0',
    izin: '0',
    alfa: '0',
    uraian: '',
    tindakLanjut: ''
  });

  const studentsInClass = pengaturan.siswaBinaan.filter(s => s.kelas === selection.kelas);

  useEffect(() => {
    if (selection.siswa && selection.kelas) {
      const { year, week } = getWeekNumber(new Date(formData.tanggal));
      const record = waliData.find(r => r.siswa === selection.siswa && r.kelas === selection.kelas && r.tahun === year && r.minggu === week);
      if (record) {
        setFormData(prev => ({
          ...prev,
          hadir: record.hadir,
          sakit: record.sakit,
          izin: record.izin,
          alfa: record.alfa,
          uraian: record.uraian,
          tindakLanjut: record.tindakLanjut
        }));
      } else {
        setFormData(prev => ({ ...prev, hadir: '0', sakit: '0', izin: '0', alfa: '0', uraian: '', tindakLanjut: '' }));
      }
    }
  }, [selection.siswa, formData.tanggal, waliData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { year, week } = getWeekNumber(new Date(formData.tanggal));
    const newRecord: WaliRecord = {
      siswa: selection.siswa,
      kelas: selection.kelas,
      tahun: year,
      minggu: week,
      hadir: formData.hadir,
      sakit: formData.sakit,
      izin: formData.izin,
      alfa: formData.alfa,
      uraian: formData.uraian,
      tindakLanjut: formData.tindakLanjut
    };

    setWaliData(prev => {
      const filtered = prev.filter(r => !(r.siswa === selection.siswa && r.kelas === selection.kelas && r.tahun === year && r.minggu === week));
      return [...filtered, newRecord];
    });
    showNotification("✅ Catatan bimbingan disimpan.");
  };

  if (pengaturan.waliKelas.length === 0) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg">
        <p className="font-bold">Perhatian</p>
        <p>Anda belum memiliki kelas binaan. Atur di tab Pengaturan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🧑‍🏫 Jurnal Guru Wali Murid</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select value={selection.kelas} onChange={e => setSelection({...selection, kelas: e.target.value, siswa: ''})} className="p-3 border rounded-lg">
          <option value="">Pilih Kelas Binaan</option>
          {pengaturan.waliKelas.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={selection.siswa} onChange={e => setSelection({...selection, siswa: e.target.value})} className="p-3 border rounded-lg">
          <option value="">Pilih Murid</option>
          {studentsInClass.map(s => <option key={s.nama} value={s.nama}>{s.nama}</option>)}
        </select>
      </div>

      {selection.siswa && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className="text-lg font-bold text-blue-800">Catatan Mingguan: {selection.siswa}</h4>
            <input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="p-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['hadir', 'sakit', 'izin', 'alfa'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs font-bold text-gray-500 uppercase">{f}</label>
                <input type="number" value={formData[f]} onChange={e => setFormData({...formData, [f]: e.target.value})} className="w-full p-2 border rounded" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Uraian Bimbingan</label>
            <textarea rows={3} value={formData.uraian} onChange={e => setFormData({...formData, uraian: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Contoh: Masalah kedisiplinan..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tindak Lanjut</label>
            <textarea rows={2} value={formData.tindakLanjut} onChange={e => setFormData({...formData, tindakLanjut: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Contoh: Pemanggilan orang tua..." />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold">SIMPAN CATATAN</button>
        </form>
      )}
    </div>
  );
};

export default GuruWaliTab;
