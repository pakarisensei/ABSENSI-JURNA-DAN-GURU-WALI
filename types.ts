
export interface PengaturanData {
  nama: string;
  nip: string;
  jabatan: string;
  mapel: string;
  waliKelas: string[];
  siswaBinaan: SiswaBinaan[];
  foto: string;
  namaSekolah: string;
  namaKepsek: string;
  nipKepsek: string;
}

export interface SiswaBinaan {
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
      [siswa: string]: 'H' | 'S' | 'I' | 'A';
    };
  };
}

export interface WaliRecord {
  siswa: string;
  kelas: string;
  tahun: number;
  minggu: number;
  hadir: string;
  sakit: string;
  izin: string;
  alfa: string;
  uraian: string;
  tindakLanjut: string;
}

export type TabType = 'jurnal' | 'absensi' | 'guru-wali' | 'laporan' | 'siswa' | 'kelas' | 'pengaturan';
