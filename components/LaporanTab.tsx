
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JurnalData, AbsensiData, PengaturanData, WaliRecord, JurnalEntry } from '../types';
import { formatHariTanggal, formatMinggu } from '../utils';

interface LaporanTabProps {
  jurnalData: JurnalData;
  absensiData: AbsensiData;
  pengaturan: PengaturanData;
  waliData: WaliRecord[];
  siswaData: Record<string, string[]>;
  showNotification: (msg: string) => void;
}

const LaporanTab: React.FC<LaporanTabProps> = ({ 
  jurnalData, 
  absensiData, 
  pengaturan, 
  waliData,
  siswaData,
  showNotification 
}) => {
  const [filter, setFilter] = useState({
    bulan: ('0' + (new Date().getMonth() + 1)).slice(-2),
    tahun: new Date().getFullYear().toString()
  });

  const cetakJurnal = () => {
    try {
      const doc = new jsPDF();
      const head = [['No', 'Hari, Tanggal', 'Jam', 'Kelas', 'Materi', 'Kegiatan']];
      const body: any[] = [];
      let counter = 1;
      Object.entries(jurnalData)
        .filter(([date]) => date.startsWith(`${filter.tahun}-${filter.bulan}`))
        .sort()
        .forEach(([date, entries]) => {
          (entries as JurnalEntry[]).sort((a,b) => a.jam.localeCompare(b.jam)).forEach(e => {
            body.push([counter++, formatHariTanggal(date), e.jam, e.kelas, e.materi, e.kegiatan]);
          });
        });

      if (body.length === 0) return showNotification("Tidak ada data jurnal.");

      doc.setFontSize(14);
      doc.text("JURNAL PEMBELAJARAN", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      autoTable(doc, { startY: 35, head: head, body: body, styles: { fontSize: 8 } });
      doc.save(`Jurnal_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) { showNotification("Gagal cetak Jurnal."); }
  };

  const cetakAbsensi = () => {
    try {
      const doc = new jsPDF();
      const periodKey = `${filter.tahun}-${filter.bulan}`;
      const relevantDates = Object.keys(absensiData).filter(d => d.startsWith(periodKey));
      if (relevantDates.length === 0) return showNotification("Tidak ada data absensi.");

      const uniqueClasses = new Set<string>();
      relevantDates.forEach(date => Object.keys(absensiData[date]).forEach(cls => uniqueClasses.add(cls)));

      Array.from(uniqueClasses).sort().forEach((kelas, idx) => {
        if (idx > 0) doc.addPage();
        doc.setFontSize(14);
        doc.text(`REKAP ABSENSI - ${kelas}`, doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
        const body = (siswaData[kelas] || []).map((nama, i) => {
          let h=0, s=0, ic=0, a=0;
          relevantDates.forEach(d => {
            const st = absensiData[d]?.[kelas]?.[nama];
            if (st==='H') h++; else if (st==='S') s++; else if (st==='I') ic++; else if (st==='A') a++;
          });
          return [i+1, nama, h, s, ic, a];
        });
        autoTable(doc, { startY: 25, head: [['No', 'Nama', 'H', 'S', 'I', 'A']], body });
      });
      doc.save(`Absensi_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) { showNotification("Gagal cetak Absensi."); }
  };

  const cetakLaporanWali = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const head = [['No', 'Murid', 'Kelas', 'Waktu', 'Kategori', 'H/S/I/A', 'Uraian Masalah', 'Strategi/Tindak Lanjut']];
      
      const body = waliData
        .filter(r => r.tahun.toString() === filter.tahun)
        .sort((a, b) => a.minggu - b.minggu)
        .map((r, idx) => [
          idx + 1,
          r.siswa,
          r.kelas,
          formatMinggu(r.tahun, r.minggu),
          r.kategori,
          `${r.hadir}/${r.sakit}/${r.izin}/${r.alfa}`,
          r.uraian,
          r.tindakLanjut
        ]);

      if (body.length === 0) return showNotification("Tidak ada data pendampingan.");

      doc.setFontSize(14);
      doc.text("LAPORAN PENDAMPINGAN INTENSIF GURU WALI", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Guru Wali: ${pengaturan.nama} | Tahun: ${filter.tahun}`, 14, 25);

      autoTable(doc, {
        startY: 35,
        head: head,
        body: body,
        styles: { fontSize: 7 },
        columnStyles: {
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          6: { cellWidth: 50 },
          7: { cellWidth: 60 }
        }
      });

      doc.save(`Laporan_GuruWali_${filter.tahun}.pdf`);
    } catch (err) { showNotification("Gagal cetak Laporan Wali."); }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Administrasi & Pelaporan</h2>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={cetakJurnal} className="p-6 border-2 border-teal-500 rounded-xl hover:bg-teal-50 text-left">
          <h4 className="font-bold text-teal-800">📝 Cetak Jurnal</h4>
        </button>
        <button onClick={cetakAbsensi} className="p-6 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 text-left">
          <h4 className="font-bold text-emerald-800">✅ Cetak Absensi</h4>
        </button>
        <button onClick={cetakLaporanWali} className="p-6 border-2 border-indigo-500 rounded-xl hover:bg-indigo-50 text-left">
          <h4 className="font-bold text-indigo-800">🧑‍🏫 Laporan Guru Wali</h4>
        </button>
      </div>
    </div>
  );
};

export default LaporanTab;
