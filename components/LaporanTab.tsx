
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
  onSyncAll?: () => void;
  isSyncingAll?: boolean;
}

const LaporanTab: React.FC<LaporanTabProps> = ({ 
  jurnalData, 
  absensiData, 
  pengaturan, 
  waliData,
  siswaData,
  showNotification,
  onSyncAll,
  isSyncingAll
}) => {
  const [filter, setFilter] = useState({
    bulan: ('0' + (new Date().getMonth() + 1)).slice(-2),
    tahun: new Date().getFullYear().toString()
  });

  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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

    const today = getTodayFormatted();

    doc.setFontSize(10);
    doc.text(`Sinjai, ${today}`, pageWidth - 70, currentY);
    currentY += 10;
    doc.text("Mengetahui,", margin, currentY);
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

  const cetakJurnalBulanan = () => {
    try {
      const doc = new jsPDF();
      const head = [['No', 'Hari, Tanggal', 'Jam', 'Kelas', 'Materi', 'Kegiatan']];
      const body: any[] = [];
      let counter = 1;
      
      Object.entries(jurnalData).filter(([date]) => date.startsWith(`${filter.tahun}-${filter.bulan}`)).sort().forEach(([date, entries]) => {
          (entries as JurnalEntry[]).sort((a,b) => a.jam.localeCompare(b.jam)).forEach(e => {
            body.push([counter++, formatHariTanggal(date), e.jam, e.kelas, e.materi, e.kegiatan]);
          });
      });
      
      if (body.length === 0) return showNotification("⚠️ Tidak ada data jurnal bulan ini.");
      
      doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text("JURNAL PEMBELAJARAN GURU BULANAN", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      
      // Metadata di bawah judul
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text(`Nama Guru: ${pengaturan.nama}`, 14, 25);
      doc.text(`Mata Pelajaran: ${pengaturan.mapel}`, 14, 30);
      doc.text(`Tanggal Unduh: ${getTodayFormatted()}`, 14, 35);
      
      autoTable(doc, { 
        startY: 42, 
        head: head, 
        body: body, 
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [45, 150, 140] }
      });
      addSignature(doc, (doc as any).lastAutoTable.finalY);
      doc.save(`Jurnal_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) { showNotification("❌ Gagal cetak Jurnal."); }
  };

  const cetakAbsensiBulanan = () => {
    try {
      const doc = new jsPDF();
      const periodKey = `${filter.tahun}-${filter.bulan}`;
      const relevantDates = Object.keys(absensiData).filter(d => d.startsWith(periodKey));
      
      if (relevantDates.length === 0) return showNotification("⚠️ Tidak ada data absensi periode ini.");
      
      const uniqueClasses = new Set<string>();
      relevantDates.forEach(date => Object.keys(absensiData[date]).forEach(cls => uniqueClasses.add(cls)));
      
      Array.from(uniqueClasses).sort().forEach((kelas, idx) => {
        if (idx > 0) doc.addPage();
        doc.setFontSize(14); doc.setFont("helvetica", "bold");
        doc.text(`REKAPITULASI ABSENSI BULANAN - ${kelas}`, doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
        
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text(`Nama Guru: ${pengaturan.nama}`, 14, 25);
        doc.text(`Mata Pelajaran: ${pengaturan.mapel}`, 14, 30);
        doc.text(`Tanggal Unduh: ${getTodayFormatted()}`, 14, 35);

        const body = (siswaData[kelas] || []).map((nama, i) => {
          let h=0, s=0, ic=0, a=0;
          relevantDates.forEach(d => {
            const st = absensiData[d]?.[kelas]?.[nama];
            if (st==='H') h++; else if (st==='S') s++; else if (st==='I') ic++; else if (st==='A') a++;
          });
          return [i+1, nama, h, s, ic, a];
        });
        
        autoTable(doc, { 
          startY: 42, 
          head: [['No', 'Nama Murid', 'H', 'S', 'I', 'A']], 
          body,
          headStyles: { fillColor: [16, 150, 160] }
        });
        addSignature(doc, (doc as any).lastAutoTable.finalY);
      });
      doc.save(`Absensi_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) { showNotification("❌ Gagal cetak Absensi."); }
  };

  const cetakLaporanWaliTahunan = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const head = [['No', 'Nama Murid', 'Kelas', 'Waktu Pendampingan', 'Presensi (H/S/I/A)', 'Uraian Kasus', 'Tindak Lanjut & Solusi']];
      
      const body = waliData
        .filter(r => r.tahun.toString() === filter.tahun)
        .sort((a, b) => a.minggu - b.minggu)
        .map((r, idx) => [
          idx+1, 
          r.siswa, 
          r.kelas, 
          formatMinggu(r.tahun, r.minggu), 
          `${r.hadir}/${r.sakit}/${r.izin}/${r.alfa}`,
          r.uraian, 
          r.tindakLanjut
        ]);
        
      if (body.length === 0) return showNotification("⚠️ Tidak ada data pendampingan tahun ini.");
      
      doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text("LAPORAN PENDAMPINGAN GURU WALI TAHUNAN", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text(`Nama Guru Wali: ${pengaturan.nama}`, 14, 25);
      doc.text(`Tahun Akademik: ${filter.tahun}`, 14, 30);
      doc.text(`Tanggal Unduh: ${getTodayFormatted()}`, doc.internal.pageSize.getWidth() - 14, 25, { align: 'right' });

      autoTable(doc, { 
        startY: 38, 
        head: head, 
        body: body, 
        styles: { fontSize: 7.5, cellPadding: 2.5 }, 
        headStyles: { fillColor: [75, 85, 200] },
        columnStyles: { 
          5: { cellWidth: 55 }, 
          6: { cellWidth: 80 } 
        } 
      });
      
      addSignature(doc, (doc as any).lastAutoTable.finalY);
      doc.save(`Laporan_Wali_${filter.tahun}.pdf`);
    } catch (err) { 
      console.error(err);
      showNotification("❌ Gagal mencetak Laporan Wali."); 
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-50">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-blue-100 p-3 rounded-2xl text-2xl">📊</span>
          ADMINISTRASI & PELAPORAN
        </h2>
      </div>
      
      <div className="bg-blue-50/50 p-10 rounded-[40px] mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 border border-blue-100 shadow-inner">
        <div>
          <label className="block text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3">Filter Bulan Laporan</label>
          <select value={filter.bulan} onChange={e => setFilter({...filter, bulan: e.target.value})} className="w-full p-5 border-none rounded-3xl font-black text-blue-900 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300">
            {[ {v:'01', n:'Januari'}, {v:'02', n:'Februari'}, {v:'03', n:'Maret'}, {v:'04', n:'April'}, {v:'05', n:'Mei'}, {v:'06', n:'Juni'}, {v:'07', n:'Juli'}, {v:'08', n:'Agustus'}, {v:'09', n:'September'}, {v:'10', n:'Oktober'}, {v:'11', n:'November'}, {v:'12', n:'Desember'} ].map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3">Tahun</label>
          <select value={filter.tahun} onChange={e => setFilter({...filter, tahun: e.target.value})} className="w-full p-5 border-none rounded-3xl font-black text-blue-900 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300">
            {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <button onClick={cetakJurnalBulanan} className="group p-10 border-2 border-teal-500 rounded-[40px] hover:bg-teal-500 transition-all text-left shadow-xl active:scale-95">
          <span className="text-4xl mb-6 block group-hover:scale-110 transition">📝</span>
          <h4 className="font-black text-teal-900 group-hover:text-white uppercase tracking-tighter text-2xl leading-none">JURNAL<br/>BULANAN</h4>
          <p className="text-[10px] font-black text-teal-600 group-hover:text-teal-100 mt-4 uppercase tracking-widest">FORMAT PDF</p>
        </button>

        <button onClick={cetakAbsensiBulanan} className="group p-10 border-2 border-emerald-500 rounded-[40px] hover:bg-emerald-500 transition-all text-left shadow-xl active:scale-95">
          <span className="text-4xl mb-6 block group-hover:scale-110 transition">✅</span>
          <h4 className="font-black text-emerald-900 group-hover:text-white uppercase tracking-tighter text-2xl leading-none">ABSENSI<br/>BULANAN</h4>
          <p className="text-[10px] font-black text-emerald-600 group-hover:text-emerald-100 mt-4 uppercase tracking-widest">FORMAT PDF</p>
        </button>

        <button onClick={cetakLaporanWaliTahunan} className="group p-10 border-2 border-indigo-500 rounded-[40px] hover:bg-indigo-500 transition-all text-left shadow-xl active:scale-95">
          <span className="text-4xl mb-6 block group-hover:scale-110 transition">🤝</span>
          <h4 className="font-black text-indigo-900 group-hover:text-white uppercase tracking-tighter text-2xl leading-none">LAPORAN<br/>WALI</h4>
          <p className="text-[10px] font-black text-indigo-600 group-hover:text-indigo-100 mt-4 uppercase tracking-widest">FORMAT PDF TAHUNAN</p>
        </button>
      </div>
    </div>
  );
};

export default LaporanTab;
