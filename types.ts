
export interface PengaturanData {
  nama: string;
  nip: string;
  jabatan: string;
  mapel: string;
  waliKelas: string[];
  siswaBinaan: MuridBinaan[];
  foto: string;
  namaSekolah: string;
  namaKepsek: string;
  nipKepsek: string;
  jabatanKepsek: string;
}

export interface MuridBinaan {
  nama: string;
  kelas: string;
}

export interface JurnalEntry {
  id: number;
  jam: string;
  kelas: string;
  mapel: string;
  materi: string;
  kegiatan: string;
}

export interface JurnalData {
  [tanggal: string]: JurnalEntry[];
}

export interface AbsensiData {
  [tanggal: string]: {
    [kelas: string]: {
      [murid: string]: 'H' | 'S' | 'I' | 'A';
    };
  };
}

export interface GradeRecord {
  tp_m1_1: string; tp_m1_2: string; tp_m1_3: string;
  tp_m2_1: string; tp_m2_2: string; tp_m2_3: string;
  tp_m3_1: string; tp_m3_2: string; tp_m3_3: string;
  lm1: string; lm2: string; lm3: string;
  akse: string;
  nilRap: string;
}

export interface NilaiData {
  [kelas: string]: {
    [murid: string]: GradeRecord;
  };
}

export interface WaliRecord {
  id: number;
  siswa: string;
  kelas: string;
  tahun: number;
  minggu: number;
  kategori: 'Akademik' | 'Karakter' | 'Kompetensi' | 'Sosial/Ekonomi' | 'Lainnya';
  hadir: string;
  sakit: string;
  izin: string;
  alfa: string;
  uraian: string;
  tindakLanjut: string;
}

export type TabType = 'jurnal' | 'absensi' | 'nilai' | 'guru-wali' | 'laporan' | 'murid' | 'kelas' | 'pengaturan';
