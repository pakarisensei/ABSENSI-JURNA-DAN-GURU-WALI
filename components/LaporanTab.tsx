
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
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

  const getWaktuSekarang = () => {
    return new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const addSignature = (doc: jsPDF, lastY: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let currentY = lastY + 15;

    if (currentY + 50 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Sinjai, ${today}`, pageWidth - 70, currentY);
    
    currentY += 10;
    doc.text("Mengetahui,", margin, currentY);
    // Menggunakan data dinamis dari Pengaturan
    doc.text(`${pengaturan.jabatanKepsek},`, margin, currentY + 5);
    doc.text("Guru Mata Pelajaran,", pageWidth - 70, currentY + 5);
    
    currentY += 30;
    doc.setFont("helvetica", "bold");
    doc.text(pengaturan.namaKepsek, margin, currentY);
    doc.text(pengaturan.nama, pageWidth - 70, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${pengaturan.nipKepsek}`, margin, currentY + 5);
    doc.text(`NIP. ${pengaturan.nip}`, pageWidth - 70, currentY + 5);
    
    return currentY + 10;
  };

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

      if (body.length === 0) return showNotification("Tidak ada data jurnal bulan ini.");

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("JURNAL PEMBELAJARAN", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Nama Guru: ${pengaturan.nama}`, 14, 25);
      doc.text(`Mata Pelajaran: ${pengaturan.mapel}`, 14, 30);
      doc.text(`Bulan: ${filter.bulan} ${filter.tahun}`, 14, 35);

      autoTable(doc, { startY: 42, head: head, body: body, styles: { fontSize: 8 } });
      addSignature(doc, (doc as any).lastAutoTable.finalY);
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
        doc.setFont("helvetica", "bold");
        doc.text(`REKAP ABSENSI - ${kelas}`, doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Bulan: ${filter.bulan} ${filter.tahun}`, 14, 25);

        const body = (siswaData[kelas] || []).map((nama, i) => {
          let h=0, s=0, ic=0, a=0;
          relevantDates.forEach(d => {
            const st = absensiData[d]?.[kelas]?.[nama];
            if (st==='H') h++; else if (st==='S') s++; else if (st==='I') ic++; else if (st==='A') a++;
          });
          return [i+1, nama, h, s, ic, a];
        });

        autoTable(doc, { startY: 35, head: [['No', 'Nama', 'H', 'S', 'I', 'A']], body });
        addSignature(doc, (doc as any).lastAutoTable.finalY);
      });
      doc.save(`Absensi_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) { showNotification("Gagal cetak Absensi."); }
  };

  const cetakLaporanWali = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const head = [['No', 'Murid', 'Kelas', 'Waktu', 'Kategori', 'H/S/I/A', 'Uraian Masalah', 'Tindak Lanjut']];
      const body = waliData
        .filter(r => r.tahun.toString() === filter.tahun)
        .sort((a, b) => a.minggu - b.minggu)
        .map((r, idx) => [idx+1, r.siswa, r.kelas, formatMinggu(r.tahun, r.minggu), r.kategori, `${r.hadir}/${r.sakit}/${r.izin}/${r.alfa}`, r.uraian, r.tindakLanjut]);

      if (body.length === 0) return showNotification("Tidak ada data pendampingan.");
      doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text("LAPORAN PENDAMPINGAN GURU WALI", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      autoTable(doc, { startY: 30, head: head, body: body, styles: { fontSize: 7 } });
      addSignature(doc, (doc as any).lastAutoTable.finalY);
      doc.save(`Laporan_Wali_${filter.tahun}.pdf`);
    } catch (err) { showNotification("Gagal cetak Laporan Wali."); }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span className="bg-blue-100 p-2 rounded-xl">📊</span>
        Administrasi & Pelaporan
      </h2>
      
      <div className="bg-blue-50/50 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 border border-blue-100 shadow-inner">
        <div>
          <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Periode Bulan</label>
          <select value={filter.bulan} onChange={e => setFilter({...filter, bulan: e.target.value})} className="w-full p-4 border rounded-xl font-bold text-blue-900 bg-white">
            {[
              {v:'01', n:'Januari'}, {v:'02', n:'Februari'}, {v:'03', n:'Maret'}, {v:'04', n:'April'}, {v:'05', n:'Mei'}, {v:'06', n:'Juni'},
              {v:'07', n:'Juli'}, {v:'08', n:'Agustus'}, {v:'09', n:'September'}, {v:'10', n:'Oktober'}, {v:'11', n:'November'}, {v:'12', n:'Desember'}
            ].map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Periode Tahun</label>
          <select value={filter.tahun} onChange={e => setFilter({...filter, tahun: e.target.value})} className="w-full p-4 border rounded-xl font-bold text-blue-900 bg-white">
            {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={cetakJurnal} className="p-8 border-2 border-teal-500 rounded-3xl hover:bg-teal-50 transition-all text-left shadow-lg active:scale-95">
          <span className="text-3xl mb-4 block">📝</span>
          <h4 className="font-black text-teal-800 uppercase tracking-tighter text-xl">Cetak Jurnal</h4>
          <p className="text-[10px] font-bold opacity-60 mt-1 uppercase">Bulan Terpilih</p>
        </button>

        <button onClick={cetakAbsensi} className="p-8 border-2 border-emerald-500 rounded-3xl hover:bg-emerald-50 transition-all text-left shadow-lg active:scale-95">
          <span className="text-3xl mb-4 block">✅</span>
          <h4 className="font-black text-emerald-800 uppercase tracking-tighter text-xl">Rekap Absensi</h4>
          <p className="text-[10px] font-bold opacity-60 mt-1 uppercase">Bulan Terpilih</p>
        </button>

        <button onClick={cetakLaporanWali} className="p-8 border-2 border-indigo-500 rounded-3xl hover:bg-indigo-50 transition-all text-left shadow-lg active:scale-95">
          <span className="text-3xl mb-4 block">🧑‍🏫</span>
          <h4 className="font-black text-indigo-800 uppercase tracking-tighter text-xl">Laporan Wali</h4>
          <p className="text-[10px] font-bold opacity-60 mt-1 uppercase">Tahun Terpilih</p>
        </button>
      </div>
    </div>
  );
};

export default LaporanTab;
