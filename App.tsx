
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PengaturanData, 
  JurnalData, 
  AbsensiData, 
  TabType, 
  WaliRecord
} from './types';
import { cloudSync } from './api';
import JurnalTab from './components/JurnalTab';
import AbsensiTab from './components/AbsensiTab';
import GuruWaliTab from './components/GuruWaliTab';
import LaporanTab from './components/LaporanTab';
import SiswaTab from './components/SiswaTab';
import KelasTab from './components/KelasTab';
import PengaturanTab from './components/PengaturanTab';

const initialMuridData = {
  "X AP 1": ["Ainia", "DALIL", "DIFTA", "Fanesatul Nafsiah", "Faris", "Hibatullah", "Irsan", "JUMRIA", "Laode Ramadani Saputra", "MIRA MUTMAINNA", "Muh. Rehan", "Muh.Erwin", "Muhammad Tanhar", "MUNASYILA", "Mutahara", "Nur Hafiza", "Ramadhani", "Syahrir", "Syahrul Ramadhan", "Wismawati"],
  "X AP 2": ["A. ZHALDY DWI PUTRA", "A.FAUZAN IKSAN", "Deswita Maharani", "ERWIN", "Fahrul", "Jihan", "M. FAHRYL CENDEKIAWAN", "M. NURFADIL", "MABRUR", "MAGFIR", "MUH. RAIHAN ZHAKI", "MUHAMMAD RAYYAN", "Mutia Syafira", "Mutiara F", "Nikra Maulana", "NURUL HAFISAH UMAIRAH", "RAIHAN MUZAKI", "SAHRA", "Sahril", "SALFINA", "Wahidin", "ZALVA ZAHIRA"],
  "XI AP 1": ["Alim Muhammad", "Alwan", "Amanda", "Ayuni Rezkiya", "Evan Ariansyah", "FADEL HIDAYA", "Fadilla", "FERI AHMAD", "Hulika", "Ikran", "Indriani Putri", "Meli Selfia", "MUHAMMAD ZAID", "Mukaddima", "Naufan Alkaisan", "NUR AMELIA", "Nur Azizah Halim", "Nuraina", "NurAzifah", "Nurul Fatiha", "RAFLI HARAHAP", "Rifaldi", "Sartika", "Suriani", "Syahrul", "Zahrani", "Zalsabilah"],
  "XI AP 2": ["A. MIFTAHUL SYARRAFA", "A.MOZHA ZERA PRATAMI", "AditIya Saputra", "Adriansyah", "Ainil Maksura", "Ainun Surya Zhalsabila", "Alya Novita Putri", "Astri", "CAHAYA MUKAMMILA", "Denis saputra", "Dimas Aditiya", "Irwan", "ISRA", "Muh. Alif", "Muh. Fajar", "Muhammad Syahrul Yasin", "Muslimah", "Musrani", "Naila Yahya", "Nur Azizah", "Rasya", "Rikal Saputra", "Sirmawati", "Suci"],
  "XII AP 1": ["ZAID"],
  "XII AP 2": ["IRFAN GUNAWAN"]
};

const initialKelasData = ["X AP 1", "X AP 2", "XI AP 1", "XI AP 2", "XII AP 1", "XII AP 2"];

const defaultPengaturan: PengaturanData = {
  nama: "Ariansyah Imran, S.Pd.,Gr",
  nip: "199002082022211011",
  jabatan: "Guru PJOK",
  mapel: "PJOK",
  waliKelas: ["X AP 1", "X AP 2", "XI AP 1", "XI AP 2", "XII AP 1", "XII AP 2"],
  siswaBinaan: [
    { nama: "DALIL", kelas: "X AP 1" },
    { nama: "Faris", kelas: "X AP 1" },
    { nama: "ERWIN", kelas: "X AP 2" },
    { nama: "SAHRA", kelas: "X AP 2" },
    { nama: "Amanda", kelas: "XI AP 1" },
    { nama: "Sirmawati", kelas: "XI AP 2" },
    { nama: "ZAID", kelas: "XII AP 1" },
    { nama: "IRFAN GUNAWAN", kelas: "XII AP 2" }
  ],
  foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ariansyah",
  namaSekolah: "UPT SMKN 4 SINJAI",
  namaKepsek: "Andi Aminah, S.Pd.,Gr",
  nipKepsek: "197010092006042002",
  jabatanKepsek: "Plt. Kepala UPT SMKN 4 Sinjai"
};

const App: React.FC = () => {
  const [pengaturan, setPengaturan] = useState<PengaturanData>(() => {
    const saved = localStorage.getItem('pengaturanData');
    return saved ? { ...defaultPengaturan, ...JSON.parse(saved) } : defaultPengaturan;
  });

  const [jurnalData, setJurnalData] = useState<JurnalData>(() => {
    const saved = localStorage.getItem('jurnalData');
    return saved ? JSON.parse(saved) : {};
  });

  const [absensiData, setAbsensiData] = useState<AbsensiData>(() => {
    const saved = localStorage.getItem('absensiData');
    return saved ? JSON.parse(saved) : {};
  });

  const [waliData, setWaliData] = useState<WaliRecord[]>(() => {
    const saved = localStorage.getItem('waliData');
    return saved ? JSON.parse(saved) : [];
  });

  const [siswaData, setSiswaData] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('siswaData');
    return saved ? JSON.parse(saved) : initialMuridData;
  });

  const [kelasData, setKelasData] = useState<string[]>(() => {
    const saved = localStorage.getItem('kelasData');
    return saved ? JSON.parse(saved) : initialKelasData;
  });

  const [jamData, setJamData] = useState<string[]>(() => {
    const saved = localStorage.getItem('jamData');
    return saved ? JSON.parse(saved) : ["1-2", "3-5", "6-8"];
  });

  const [activeTab, setActiveTab] = useState<TabType>('jurnal');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('lastSyncTime'));

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Simpan ke localStorage setiap ada perubahan (Auto-Save Lokal)
  useEffect(() => { localStorage.setItem('pengaturanData', JSON.stringify(pengaturan)); }, [pengaturan]);
  useEffect(() => { localStorage.setItem('jurnalData', JSON.stringify(jurnalData)); }, [jurnalData]);
  useEffect(() => { localStorage.setItem('absensiData', JSON.stringify(absensiData)); }, [absensiData]);
  useEffect(() => { localStorage.setItem('waliData', JSON.stringify(waliData)); }, [waliData]);
  useEffect(() => { localStorage.setItem('siswaData', JSON.stringify(siswaData)); }, [siswaData]);
  useEffect(() => { localStorage.setItem('kelasData', JSON.stringify(kelasData)); }, [kelasData]);
  useEffect(() => { localStorage.setItem('jamData', JSON.stringify(jamData)); }, [jamData]);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    showNotification("🚀 Mengirim Data ke 7 Sheet Cloud...");
    
    const fullBackup = {
      jurnal: jurnalData,
      absensi: absensiData,
      wali: waliData,
      murid: siswaData,
      kelas: kelasData,
      jam: jamData,
      pengaturan: pengaturan
    };

    const success = await cloudSync.saveAll(fullBackup);

    if (success) {
      const now = new Date().toLocaleString('id-ID');
      setLastSync(now);
      localStorage.setItem('lastSyncTime', now);
      showNotification("✅ DATA 7-SHEET BERHASIL DI-BACKUP!");
    } else {
      showNotification("⚠️ Gagal Sinkron. Cek koneksi internet.");
    }
    setIsSyncing(false);
  };

  const loadFromCloud = async () => {
    setIsSyncing(true);
    showNotification("📥 Mengambil Data dari 7 Sheet...");
    try {
      const data = await cloudSync.load();
      if (!data) {
        showNotification("❌ Cloud Kosong atau Gagal Terhubung.");
        return;
      }
      
      if (window.confirm(`🔍 Data Cloud Ditemukan. Ingin menimpa data di perangkat Bapak? (Semua data saat ini akan diganti)`)) {
        // Update semua state dari data Cloud
        if (data.pengaturan) setPengaturan(data.pengaturan);
        if (data.jurnal) setJurnalData(data.jurnal);
        if (data.absensi) setAbsensiData(data.absensi);
        if (data.wali) setWaliData(data.wali);
        if (data.murid) setSiswaData(data.murid);
        if (data.kelas) setKelasData(data.kelas);
        if (data.jam) setJamData(data.jam);
        
        showNotification("✅ SELURUH DATA BERHASIL DIMUAT ULANG!");
      }
    } catch (err) {
      showNotification("❌ Gagal memproses data Cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  const NavItem = ({ id, label }: { id: TabType, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest whitespace-nowrap ${
        activeTab === id ? 'bg-gray-900 text-white shadow-xl scale-105' : 'text-gray-400 hover:text-teal-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      <div className="bg-white rounded-[40px] shadow-sm p-8 mb-6 flex flex-col md:flex-row items-center justify-between border border-gray-100 no-print">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-1 ring-gray-100">
            <img src={pengaturan.foto} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">{pengaturan.nama}</h1>
            <p className="text-sm font-bold text-gray-400 mb-2">NIP. {pengaturan.nip}</p>
            <div className="flex flex-col gap-1">
               <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
                {pengaturan.jabatan}
               </span>
               {lastSync && (
                 <p className="text-[8px] font-bold text-teal-400 uppercase tracking-widest mt-1">🕒 TERAKHIR SINKRON: {lastSync}</p>
               )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-6 md:mt-0 items-center md:items-end">
          <div className="flex gap-2">
            <button 
              onClick={handleSyncAll} 
              disabled={isSyncing} 
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSyncing ? <div className="loader !w-3 !h-3" /> : '☁️ SIMPAN CLOUD'}
            </button>
            <button 
              onClick={loadFromCloud} 
              disabled={isSyncing}
              className="bg-orange-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              📥 MUAT ULANG
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-[32px] p-2 mb-10 flex justify-start md:justify-center gap-1 border border-gray-100 no-print overflow-x-auto scrollbar-hide">
        <NavItem id="jurnal" label="Jurnal" />
        <NavItem id="absensi" label="Absensi" />
        <NavItem id="guru-wali" label="Guru WALI" />
        <NavItem id="laporan" label="Laporan" />
        <NavItem id="murid" label="Murid" />
        <NavItem id="kelas" label="Kelas" />
        <NavItem id="pengaturan" label="Setting" />
      </div>

      <div className="animate-fade-in flex-grow pb-10">
        {activeTab === 'jurnal' && <JurnalTab pengaturan={pengaturan} jurnalData={jurnalData} setJurnalData={setJurnalData} kelasData={kelasData} jamData={jamData} showNotification={showNotification} />}
        {activeTab === 'absensi' && <AbsensiTab absensiData={absensiData} setAbsensiData={setAbsensiData} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'guru-wali' && <GuruWaliTab pengaturan={pengaturan} waliData={waliData} setWaliData={setWaliData} showNotification={showNotification} />}
        {activeTab === 'laporan' && <LaporanTab jurnalData={jurnalData} absensiData={absensiData} pengaturan={pengaturan} waliData={waliData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'murid' && <SiswaTab siswaData={siswaData} setSiswaData={setSiswaData} kelasData={kelasData} showNotification={showNotification} />}
        {activeTab === 'kelas' && <KelasTab kelasData={kelasData} setKelasData={setKelasData} jamData={jamData} setJamData={setJamData} showNotification={showNotification} />}
        {activeTab === 'pengaturan' && <PengaturanTab pengaturan={pengaturan} setPengaturan={setPengaturan} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
      </div>

      <footer className="mt-auto py-8 text-center no-print border-t border-gray-100 opacity-50">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">@2026 MANAJEMEN GURU MAPEL - ARIANSYAH IMRAN</p>
      </footer>

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-10 py-5 rounded-[28px] shadow-2xl z-[100] font-black text-[11px] uppercase tracking-widest animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
};

export default App;
