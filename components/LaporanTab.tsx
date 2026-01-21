
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JurnalData, AbsensiData, NilaiData, PengaturanData, WaliRecord, JurnalEntry } from '../types';
import { formatHariTanggal, formatMinggu } from '../utils';

interface LaporanTabProps {
  jurnalData: JurnalData;
  absensiData: AbsensiData;
  nilaiData: NilaiData;
  pengaturan: PengaturanData;
  waliData: WaliRecord[];
  siswaData: Record<string, string[]>;
  kelasData: string[];
  showNotification: (msg: string) => void;
  onSyncAll?: () => void;
  isSyncingAll?: boolean;
}

const LaporanTab: React.FC<LaporanTabProps> = ({ 
  jurnalData, 
  absensiData, 
  nilaiData,
  pengaturan, 
  waliData,
  siswaData,
  kelasData,
  showNotification,
  onSyncAll,
  isSyncingAll
}) => {
  const [filter, setFilter] = useState({
    bulan: ('0' + (new Date().getMonth() + 1)).slice(-2),
    tahun: new Date().getFullYear().toString(),
    kelas: '' // Kosong berarti semua kelas
  });

  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const addSignature = (doc: jsPDF, lastY: number, orientation: 'p' | 'l' = 'p') => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let currentY = lastY + 15;

    if (currentY + 50 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    const today = getTodayFormatted();
    const signatureX = orientation === 'p' ? pageWidth - 70 : pageWidth - 80;

    doc.setFontSize(10);
    doc.text(`Sinjai, ${today}`, signatureX, currentY);
    currentY += 10;
    doc.text("Mengetahui,", margin, currentY);
    doc.text(`${pengaturan.jabatanKepsek},`, margin, currentY + 5);
    doc.text("Guru Mata Pelajaran,", signatureX, currentY + 5);
    currentY += 30;
    doc.setFont("helvetica", "bold");
    doc.text(pengaturan.namaKepsek, margin, currentY);
    doc.text(pengaturan.nama, signatureX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${pengaturan.nipKepsek}`, margin, currentY + 5);
    doc.text(`NIP. ${pengaturan.nip}`, signatureX, currentY + 5);
    return currentY + 10;
  };

  const cetakJurnalBulanan = () => {
    try {
      const doc = new jsPDF();
      const periodKey = `${filter.tahun}-${filter.bulan}`;
      
      // Ambil daftar kelas yang akan dicetak
      const classesToPrint = filter.kelas ? [filter.kelas] : kelasData;
      let hasDataAtAll = false;

      classesToPrint.forEach((kelas, idx) => {
        const body: any[] = [];
        let counter = 1;

        Object.entries(jurnalData)
          .filter(([date]) => date.startsWith(periodKey))
          .sort()
          .forEach(([date, entries]) => {
            (entries as JurnalEntry[])
              .filter(e => e.kelas === kelas)
              .sort((a,b) => a.jam.localeCompare(b.jam))
              .forEach(e => {
                body.push([counter++, formatHariTanggal(date), e.jam, e.kelas, e.materi, e.kegiatan]);
              });
          });

        if (body.length > 0) {
          if (hasDataAtAll) doc.addPage();
          hasDataAtAll = true;

          doc.setFontSize(14); doc.setFont("helvetica", "bold");
          doc.text(`JURNAL PEMBELAJARAN - KELAS ${kelas}`, doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
          
          doc.setFontSize(10); doc.setFont("helvetica", "normal");
          doc.text(`Nama Guru: ${pengaturan.nama}`, 14, 25);
          doc.text(`Mata Pelajaran: ${pengaturan.mapel}`, 14, 30);
          doc.text(`Periode: ${filter.bulan}/${filter.tahun}`, 14, 35);
          
          autoTable(doc, { 
            startY: 42, 
            head: [['No', 'Hari, Tanggal', 'Jam', 'Kelas', 'Materi', 'Kegiatan']], 
            body: body, 
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [45, 150, 140] }
          });
          addSignature(doc, (doc as any).lastAutoTable.finalY);
        }
      });
      
      if (!hasDataAtAll) return showNotification("⚠️ Tidak ada data jurnal untuk periode & kelas ini.");
      doc.save(`Jurnal_${filter.kelas || 'Semua_Kelas'}_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) { showNotification("❌ Gagal cetak Jurnal."); }
  };

  const cetakAbsensiBulanan = () => {
    try {
      const doc = new jsPDF();
      const periodKey = `${filter.tahun}-${filter.bulan}`;
      const relevantDates = Object.keys(absensiData).filter(d => d.startsWith(periodKey));
      
      if (relevantDates.length === 0) return showNotification("⚠️ Tidak ada data absensi periode ini.");
      
      const classesToPrint = filter.kelas ? [filter.kelas] : kelasData;
      let hasDataAtAll = false;

      classesToPrint.forEach((kelas) => {
        const body = (siswaData[kelas] || []).map((nama, i) => {
          let h=0, s=0, ic=0, a=0;
          let hasClassData = false;
          relevantDates.forEach(d => {
            if (absensiData[d]?.[kelas]) {
              hasClassData = true;
              const st = absensiData[d][kelas][nama];
              if (st==='H') h++; else if (st==='S') s++; else if (st==='I') ic++; else if (st==='A') a++;
            }
          });
          return { data: [i+1, nama, h, s, ic, a], hasClassData };
        });

        // Hanya cetak jika ada setidaknya satu record untuk kelas ini di periode ini
        if (body.some(b => b.hasClassData)) {
          if (hasDataAtAll) doc.addPage();
          hasDataAtAll = true;

          doc.setFontSize(14); doc.setFont("helvetica", "bold");
          doc.text(`REKAPITULASI ABSENSI BULANAN - ${kelas}`, doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
          
          doc.setFontSize(10); doc.setFont("helvetica", "normal");
          doc.text(`Nama Guru: ${pengaturan.nama}`, 14, 25);
          doc.text(`Mata Pelajaran: ${pengaturan.mapel}`, 14, 30);
          doc.text(`Periode: ${filter.bulan}/${filter.tahun}`, 14, 35);

          autoTable(doc, { 
            startY: 42, 
            head: [['No', 'Nama Murid', 'H', 'S', 'I', 'A']], 
            body: body.map(b => b.data),
            headStyles: { fillColor: [16, 150, 160] }
          });
          addSignature(doc, (doc as any).lastAutoTable.finalY);
        }
      });

      if (!hasDataAtAll) return showNotification("⚠️ Tidak ada data absensi untuk kelas ini.");
      doc.save(`Absensi_${filter.kelas || 'Semua_Kelas'}_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) { showNotification("❌ Gagal cetak Absensi."); }
  };

  const cetakDaftarNilai = () => {
    try {
      const classesToPrint = filter.kelas ? [filter.kelas] : kelasData;
      let hasDataAtAll = false;

      const doc = new jsPDF('l', 'mm', 'a4');
      
      classesToPrint.forEach((kelas) => {
        if (nilaiData[kelas]) {
          if (hasDataAtAll) doc.addPage();
          hasDataAtAll = true;
          
          doc.setFontSize(14); doc.setFont("helvetica", "bold");
          doc.text(`DAFTAR NILAI KURIKULUM MERDEKA - ${kelas}`, doc.internal.pageSize.getWidth()/2, 12, { align: 'center' });
          
          doc.setFontSize(9); doc.setFont("helvetica", "normal");
          doc.text(`Nama Guru: ${pengaturan.nama}`, 14, 20);
          doc.text(`Mata Pelajaran: ${pengaturan.mapel}`, 14, 25);
          doc.text(`Sekolah: ${pengaturan.namaSekolah}`, doc.internal.pageSize.getWidth() - 14, 20, { align: 'right' });

          const body = (siswaData[kelas] || []).sort().map((nama, i) => {
            const g = nilaiData[kelas][nama] || {};
            return [
              i+1, nama, 
              g.tp_m1_1||'', g.tp_m1_2||'', g.tp_m1_3||'',
              g.tp_m2_1||'', g.tp_m2_2||'', g.tp_m2_3||'',
              g.tp_m3_1||'', g.tp_m3_2||'', g.tp_m3_3||'',
              g.lm1||'', g.lm2||'', g.lm3||'', g.akse||'', 
              g.nilRap||'-'
            ];
          });

          autoTable(doc, {
            startY: 32,
            head: [
              [{ content: 'NO', rowSpan: 2 }, { content: 'NAMA SISWA', rowSpan: 2 }, { content: 'ASESMEN FORMATIF', colSpan: 9 }, { content: 'ASESMEN SUMATIF', colSpan: 4 }, { content: 'NIL RAP', rowSpan: 2 }],
              ['M1.1', 'M1.2', 'M1.3', 'M2.1', 'M2.2', 'M2.3', 'M3.1', 'M3.2', 'M3.3', 'LM1', 'LM2', 'LM3', 'AKSE']
            ],
            body: body,
            theme: 'grid',
            styles: { fontSize: 7, halign: 'center', cellPadding: 1.5 },
            headStyles: { fillColor: [40, 40, 40] },
            columnStyles: { 1: { halign: 'left', fontStyle: 'bold', cellWidth: 45 } }
          });

          addSignature(doc, (doc as any).lastAutoTable.finalY, 'l');
        }
      });

      if (!hasDataAtAll) return showNotification("⚠️ Belum ada data nilai untuk dicetak.");
      doc.save(`Daftar_Nilai_${filter.kelas || 'Semua_Kelas'}.pdf`);
    } catch (err) { showNotification("❌ Gagal cetak Nilai."); }
  };

  const cetakLaporanWaliTahunan = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const head = [['No', 'Nama Murid', 'Kelas', 'Waktu Pendampingan', 'Presensi (H/S/I/A)', 'Uraian Kasus', 'Tindak Lanjut & Solusi']];
      
      // Merekap seluruh bimbingan di tahun tersebut (seperti sebelumnya - full recap)
      const body = waliData
        .filter(r => r.tahun.toString() === filter.tahun)
        .sort((a, b) => a.minggu - b.minggu)
        .map((r, idx) => [
          idx+1, r.siswa, r.kelas, 
          formatMinggu(r.tahun, r.minggu), 
          `${r.hadir}/${r.sakit}/${r.izin}/${r.alfa}`,
          r.uraian, r.tindakLanjut
        ]);
        
      if (body.length === 0) return showNotification("⚠️ Tidak ada data bimbingan di tahun ini.");
      
      doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text("LAPORAN REKAPITULASI PENDAMPINGAN GURU WALI", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text(`Nama Guru: ${pengaturan.nama}`, 14, 25);
      doc.text(`Tahun Pelajaran: ${filter.tahun}`, 14, 30);

      autoTable(doc, { 
        startY: 38, head: head, body: body, 
        styles: { fontSize: 7.5 }, 
        headStyles: { fillColor: [75, 85, 200] }
      });
      
      addSignature(doc, (doc as any).lastAutoTable.finalY, 'l');
      doc.save(`Rekap_Guru_Wali_${filter.tahun}.pdf`);
    } catch (err) { showNotification("❌ Gagal mencetak Laporan Wali."); }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-50">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
          <span className="bg-blue-100 p-3 rounded-2xl text-2xl">📊</span>
          ADMINISTRASI & PELAPORAN
        </h2>
      </div>
      
      <div className="bg-blue-50/50 p-10 rounded-[40px] mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 border border-blue-100 shadow-inner">
        <div>
          <label className="block text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3">Filter Bulan (Jurnal/Absen)</label>
          <select value={filter.bulan} onChange={e => setFilter({...filter, bulan: e.target.value})} className="w-full p-5 border-none rounded-3xl font-black text-blue-900 bg-white shadow-sm outline-none">
            {[ {v:'01', n:'Januari'}, {v:'02', n:'Februari'}, {v:'03', n:'Maret'}, {v:'04', n:'April'}, {v:'05', n:'Mei'}, {v:'06', n:'Juni'}, {v:'07', n:'Juli'}, {v:'08', n:'Agustus'}, {v:'09', n:'September'}, {v:'10', n:'Oktober'}, {v:'11', n:'November'}, {v:'12', n:'Desember'} ].map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3">Tahun</label>
          <select value={filter.tahun} onChange={e => setFilter({...filter, tahun: e.target.value})} className="w-full p-5 border-none rounded-3xl font-black text-blue-900 bg-white shadow-sm outline-none">
            {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3">Pilih Kelas Spesifik</label>
          <select value={filter.kelas} onChange={e => setFilter({...filter, kelas: e.target.value})} className="w-full p-5 border-none rounded-3xl font-black text-blue-900 bg-white shadow-sm outline-none">
            <option value="">-- SEMUA KELAS --</option>
            {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onClick={cetakJurnalBulanan} className="group p-8 border-2 border-teal-500 rounded-[32px] hover:bg-teal-500 transition-all text-left shadow-lg active:scale-95">
          <span className="text-3xl mb-4 block group-hover:scale-110 transition">📝</span>
          <h4 className="font-black text-teal-900 group-hover:text-white uppercase tracking-tighter text-xl leading-tight">JURNAL<br/>{filter.kelas || 'PER KELAS'}</h4>
        </button>

        <button onClick={cetakAbsensiBulanan} className="group p-8 border-2 border-emerald-500 rounded-[32px] hover:bg-emerald-500 transition-all text-left shadow-lg active:scale-95">
          <span className="text-3xl mb-4 block group-hover:scale-110 transition">✅</span>
          <h4 className="font-black text-emerald-900 group-hover:text-white uppercase tracking-tighter text-xl leading-tight">ABSENSI<br/>{filter.kelas || 'PER KELAS'}</h4>
        </button>

        <button onClick={cetakDaftarNilai} className="group p-8 border-2 border-pink-500 rounded-[32px] hover:bg-pink-500 transition-all text-left shadow-lg active:scale-95">
          <span className="text-3xl mb-4 block group-hover:scale-110 transition">📊</span>
          <h4 className="font-black text-pink-900 group-hover:text-white uppercase tracking-tighter text-xl leading-tight">DAFTAR NILAI<br/>{filter.kelas || 'PER KELAS'}</h4>
        </button>

        <button onClick={cetakLaporanWaliTahunan} className="group p-8 border-2 border-indigo-500 rounded-[32px] hover:bg-indigo-500 transition-all text-left shadow-lg active:scale-95">
          <span className="text-3xl mb-4 block group-hover:scale-110 transition">🤝</span>
          <h4 className="font-black text-indigo-900 group-hover:text-white uppercase tracking-tighter text-xl leading-tight">LAPORAN WALI<br/>REKAP TOTAL</h4>
        </button>
      </div>
    </div>
  );
};

export default LaporanTab;
