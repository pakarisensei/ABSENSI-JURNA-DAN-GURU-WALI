
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JurnalData, AbsensiData, PengaturanData, WaliRecord, JurnalEntry } from '../types';
import { formatHariTanggal } from '../utils';

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
      const period = `${filter.bulan}/${filter.tahun}`;
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

      if (body.length === 0) return showNotification("Tidak ada data jurnal untuk periode ini.");

      doc.setFontSize(14);
      doc.text("JURNAL PEMBELAJARAN", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Guru: ${pengaturan.nama}`, 14, 25);
      doc.text(`Periode: ${period}`, 14, 30);

      autoTable(doc, {
        startY: 35,
        head: head,
        body: body,
        styles: { fontSize: 8 },
        columnStyles: { 4: { cellWidth: 50 }, 5: { cellWidth: 50 } }
      });

      doc.save(`Jurnal_${pengaturan.nama}_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) {
      console.error(err);
      showNotification("Gagal mencetak Jurnal. Pastikan data tersedia.");
    }
  };

  const cetakAbsensi = () => {
    try {
      const doc = new jsPDF();
      const periodStr = `${filter.bulan}/${filter.tahun}`;
      const periodKey = `${filter.tahun}-${filter.bulan}`;

      const relevantDates = Object.keys(absensiData).filter(d => d.startsWith(periodKey));
      
      if (relevantDates.length === 0) {
        return showNotification("Tidak ada data absensi untuk periode ini.");
      }

      const uniqueClasses = new Set<string>();
      relevantDates.forEach(date => {
        Object.keys(absensiData[date]).forEach(cls => uniqueClasses.add(cls));
      });

      let isFirstPage = true;

      Array.from(uniqueClasses).sort().forEach(kelas => {
        if (!isFirstPage) doc.addPage();
        isFirstPage = false;

        doc.setFontSize(14);
        doc.text("REKAPITULASI KEHADIRAN MURID", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Sekolah: ${pengaturan.namaSekolah}`, 14, 25);
        doc.text(`Guru: ${pengaturan.nama}`, 14, 30);
        doc.text(`Kelas: ${kelas} | Periode: ${periodStr}`, 14, 35);

        const head = [['No', 'Nama Murid', 'H', 'S', 'I', 'A', 'Total %']];
        const body: any[] = [];
        
        const muridList = (siswaData[kelas] || []).sort();
        
        muridList.forEach((nama, idx) => {
          let h = 0, s = 0, i_count = 0, a = 0;
          let totalHari = 0;

          relevantDates.forEach(date => {
            const status = absensiData[date]?.[kelas]?.[nama];
            if (status) {
              totalHari++;
              if (status === 'H') h++;
              else if (status === 'S') s++;
              else if (status === 'I') i_count++;
              else if (status === 'A') a++;
            }
          });

          const persentase = totalHari > 0 ? ((h / totalHari) * 100).toFixed(1) + '%' : '-';
          body.push([idx + 1, nama, h, s, i_count, a, persentase]);
        });

        autoTable(doc, {
          startY: 40,
          head: head,
          body: body,
          theme: 'grid',
          headStyles: { fillColor: [13, 148, 136] },
          styles: { fontSize: 9 }
        });
      });

      doc.save(`Rekap_Absensi_${filter.bulan}_${filter.tahun}.pdf`);
    } catch (err) {
      console.error(err);
      showNotification("Gagal mencetak Absensi.");
    }
  };

  const cetakLaporanWali = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const period = filter.tahun;
      const head = [['No', 'Murid', 'Kelas', 'Thn/Mgg', 'H', 'S', 'I', 'A', 'Uraian Bimbingan', 'Tindak Lanjut']];
      
      const body = waliData
        .filter(r => r.tahun.toString() === filter.tahun)
        .sort((a, b) => a.minggu - b.minggu)
        .map((r, idx) => [
          idx + 1,
          r.siswa,
          r.kelas,
          `${r.tahun}/W${r.minggu}`,
          r.hadir,
          r.sakit,
          r.izin,
          r.alfa,
          r.uraian,
          r.tindakLanjut
        ]);

      if (body.length === 0) return showNotification("Tidak ada data bimbingan wali untuk tahun ini.");

      doc.setFontSize(14);
      doc.text("LAPORAN BIMBINGAN GURU WALI MURID", doc.internal.pageSize.getWidth()/2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Guru Wali: ${pengaturan.nama}`, 14, 25);
      doc.text(`Tahun: ${period}`, 14, 30);

      autoTable(doc, {
        startY: 35,
        head: head,
        body: body,
        styles: { fontSize: 7 },
        columnStyles: {
          8: { cellWidth: 60 },
          9: { cellWidth: 50 }
        }
      });

      doc.save(`Laporan_Wali_${pengaturan.nama}_${filter.tahun}.pdf`);
    } catch (err) {
      console.error(err);
      showNotification("Gagal mencetak Laporan Wali.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Laporan & Cetak PDF</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-800">Bulan (Untuk Jurnal/Absensi)</label>
          <select value={filter.bulan} onChange={e => setFilter({...filter, bulan: e.target.value})} className="w-full p-3 border rounded-lg">
            {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-800">Tahun</label>
          <select value={filter.tahun} onChange={e => setFilter({...filter, tahun: e.target.value})} className="w-full p-3 border rounded-lg">
            {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={cetakJurnal} className="p-6 border-2 border-teal-500 rounded-xl hover:bg-teal-50 transition text-left group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition">📝</div>
          <h4 className="font-bold text-teal-800">Cetak Jurnal</h4>
          <p className="text-xs text-gray-500">Unduh jurnal harian dalam format PDF</p>
        </button>

        <button onClick={cetakAbsensi} className="p-6 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition text-left group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition">✅</div>
          <h4 className="font-bold text-emerald-800">Cetak Absensi</h4>
          <p className="text-xs text-gray-500">Unduh rekap kehadiran bulanan</p>
        </button>

        <button onClick={cetakLaporanWali} className="p-6 border-2 border-indigo-500 rounded-xl hover:bg-indigo-50 transition text-left group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition">🧑‍🏫</div>
          <h4 className="font-bold text-indigo-800">Laporan Guru Wali</h4>
          <p className="text-xs text-gray-500">Unduh rekap bimbingan murid binaan</p>
        </button>
      </div>
    </div>
  );
};

export default LaporanTab;
