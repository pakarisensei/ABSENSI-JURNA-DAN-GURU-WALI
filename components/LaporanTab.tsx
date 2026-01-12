
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// Added JurnalEntry to the import list
import { JurnalData, AbsensiData, PengaturanData, WaliRecord, JurnalEntry } from '../types';
import { formatTanggal, formatHariTanggal } from '../utils';

interface LaporanTabProps {
  jurnalData: JurnalData;
  absensiData: AbsensiData;
  pengaturan: PengaturanData;
  waliData: WaliRecord[];
  showNotification: (msg: string) => void;
}

const LaporanTab: React.FC<LaporanTabProps> = ({ 
  jurnalData, 
  absensiData, 
  pengaturan, 
  waliData,
  showNotification 
}) => {
  const [filter, setFilter] = useState({
    bulan: ('0' + (new Date().getMonth() + 1)).slice(-2),
    tahun: new Date().getFullYear().toString()
  });

  const cetakJurnal = () => {
    const doc = new jsPDF();
    const period = `${filter.bulan}/${filter.tahun}`;
    const head = [['No', 'Hari, Tanggal', 'Jam', 'Kelas', 'Materi', 'Kegiatan']];
    const body: any[] = [];
    
    let counter = 1;
    Object.entries(jurnalData)
      .filter(([date]) => date.startsWith(`${filter.tahun}-${filter.bulan}`))
      .sort()
      .forEach(([date, entries]) => {
        // Fix: Explicitly type entries to JurnalEntry[] to resolve 'unknown' type error
        (entries as JurnalEntry[]).sort((a,b) => a.jam.localeCompare(b.jam)).forEach(e => {
          body.push([counter++, formatHariTanggal(date), e.jam, e.kelas, e.materi, e.kegiatan]);
        });
      });

    if (body.length === 0) return showNotification("Tidak ada data untuk periode ini.");

    doc.setFontSize(14);
    doc.text("JURNAL PEMBELAJARAN", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Guru: ${pengaturan.nama}`, 14, 25);
    doc.text(`Periode: ${period}`, 14, 30);

    (doc as any).autoTable({
      startY: 35,
      head: head,
      body: body,
      styles: { fontSize: 8 },
      columnStyles: { 4: { cellWidth: 50 }, 5: { cellWidth: 50 } }
    });

    doc.save(`Jurnal_${pengaturan.nama}_${filter.bulan}_${filter.tahun}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Laporan & Cetak PDF</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Bulan</label>
          <select value={filter.bulan} onChange={e => setFilter({...filter, bulan: e.target.value})} className="w-full p-3 border rounded-lg">
            {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tahun</label>
          <select value={filter.tahun} onChange={e => setFilter({...filter, tahun: e.target.value})} className="w-full p-3 border rounded-lg">
            {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={cetakJurnal} className="p-6 border-2 border-teal-500 rounded-xl hover:bg-teal-50 transition text-left group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition">📝</div>
          <h4 className="font-bold text-teal-800">Cetak Jurnal</h4>
          <p className="text-xs text-gray-500">Unduh jurnal harian dalam format PDF</p>
        </button>
        <button onClick={() => showNotification("Fitur cetak absensi segera hadir!")} className="p-6 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition text-left group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition">✅</div>
          <h4 className="font-bold text-emerald-800">Cetak Absensi</h4>
          <p className="text-xs text-gray-500">Unduh rekap kehadiran bulanan</p>
        </button>
      </div>
    </div>
  );
};

export default LaporanTab;
