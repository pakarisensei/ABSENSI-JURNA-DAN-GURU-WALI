
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

export type TabType = 'jurnal' | 'absensi' | 'guru-wali' | 'laporan' | 'murid' | 'kelas' | 'pengaturan';
