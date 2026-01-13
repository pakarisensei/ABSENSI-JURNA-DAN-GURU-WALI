
import React, { useState, useEffect, useCallback } from 'react';
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
  "XII AP 1": [],
  "XII AP 2": []
};

const initialKelasData = ["X AP 1", "X AP 2", "XI AP 1", "XI AP 2", "XII AP 1", "XII AP 2"];

const App: React.FC = () => {
  const [pengaturan, setPengaturan] = useState<PengaturanData>(() => {
    const saved = localStorage.getItem('pengaturanData');
    if (saved && saved !== '{}' && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        return {
          namaKepsek: "Andi Aminah, S.Pd.,Gr",
          nipKepsek: "197010092006042002",
          jabatanKepsek: "Plt. Kepala UPT SMKN 4 Sinjai",
          siswaBinaan: [],
          ...parsed
        };
      } catch (e) { console.error(e); }
    }
    return {
      nama: "Ariansyah Imran, S.Pd.,Gr",
      nip: "199002082022211011",
      jabatan: "Guru PJOK",
      mapel: "PJOK",
      waliKelas: ["X AP 1", "X AP 2", "XI AP 1", "XI AP 2"],
      siswaBinaan: [],
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ariansyah",
      namaSekolah: "UPT SMKN 4 SINJAI",
      namaKepsek: "Andi Aminah, S.Pd.,Gr",
      nipKepsek: "197010092006042002",
      jabatanKepsek: "Plt. Kepala UPT SMKN 4 Sinjai"
    };
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
    if (saved && saved !== '{}') {
      try { return JSON.parse(saved); } catch (e) { return initialMuridData; }
    }
    return initialMuridData;
  });

  const [kelasData, setKelasData] = useState<string[]>(() => {
    const saved = localStorage.getItem('kelasData');
    return (saved && saved !== '[]') ? JSON.parse(saved) : initialKelasData;
  });

  const [jamData, setJamData] = useState<string[]>(() => {
    const saved = localStorage.getItem('jamData');
    return (saved && saved !== '[]') ? JSON.parse(saved) : ["1-2", "3-4", "5-6", "7-8", "9-10"];
  });

  const [activeTab, setActiveTab] = useState<TabType>('jurnal');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Simpan Otomatis ke Local Storage
  useEffect(() => { localStorage.setItem('pengaturanData', JSON.stringify(pengaturan)); }, [pengaturan]);
  useEffect(() => { localStorage.setItem('jurnalData', JSON.stringify(jurnalData)); }, [jurnalData]);
  useEffect(() => { localStorage.setItem('absensiData', JSON.stringify(absensiData)); }, [absensiData]);
  useEffect(() => { localStorage.setItem('waliData', JSON.stringify(waliData)); }, [waliData]);
  useEffect(() => { localStorage.setItem('siswaData', JSON.stringify(siswaData)); }, [siswaData]);
  useEffect(() => { localStorage.setItem('kelasData', JSON.stringify(kelasData)); }, [kelasData]);
  useEffect(() => { localStorage.setItem('jamData', JSON.stringify(jamData)); }, [jamData]);

  const saveToCloud = async () => {
    setIsSyncing(true);
    showNotification("☁️ Menyimpan Data ke Cloud...");
    try {
      const allData = { 
        pengaturan, 
        jurnal: jurnalData, 
        absensi: absensiData, 
        wali: waliData, 
        murid: siswaData, 
        kelas: kelasData, 
        jam: jamData 
      };
      await cloudSync.save(allData);
      showNotification("✅ Berhasil! Data Murid & Jurnal aman di Cloud.");
    } catch (err) {
      showNotification("❌ Cloud Error. Cek koneksi internet.");
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromCloud = async () => {
    if (!confirm("Muat data dari Cloud akan menimpa data di perangkat ini. Lanjutkan?")) return;
    setIsSyncing(true);
    showNotification("📥 Mengunduh data dari Cloud...");
    try {
      const data = await cloudSync.load();
      if (data && typeof data === 'object') {
        // Update State Satu per Satu
        if (data.pengaturan) setPengaturan({ ...data.pengaturan, siswaBinaan: data.pengaturan.siswaBinaan || [] });
        if (data.murid) setSiswaData(data.murid);
        if (data.jurnal) setJurnalData(data.jurnal);
        if (data.absensi) setAbsensiData(data.absensi);
        if (data.wali) setWaliData(data.wali);
        if (data.kelas) setKelasData(data.kelas);
        if (data.jam) setJamData(data.jam);
        
        showNotification("✅ Data Murid & Jurnal berhasil dipulihkan!");
      } else {
        showNotification("ℹ️ Belum ada data di Cloud.");
      }
    } catch (err) {
      showNotification("❌ Gagal memuat data Cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  const forceLoadDefault = () => {
    setSiswaData(initialMuridData);
    showNotification("✅ Data murid AP berhasil dipulihkan.");
  };

  const NavItem = ({ id, label }: { id: TabType, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-5 py-2.5 rounded-xl transition-all font-bold text-xs whitespace-nowrap ${
        activeTab === id 
          ? 'bg-teal-600 text-white shadow-md' 
          : 'text-gray-500 hover:text-teal-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header Profile */}
      <div className="bg-white rounded-[40px] shadow-sm p-8 mb-6 flex flex-col md:flex-row items-center justify-between border border-gray-100 relative">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100">
            <img src={pengaturan.foto} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{pengaturan.nama}</h1>
            <p className="text-sm font-medium text-gray-400 mb-2">NIP. {pengaturan.nip}</p>
            <span className="bg-teal-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block">
              {pengaturan.jabatan}
            </span>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex flex-col items-end gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-2 px-4 shadow-sm flex flex-col items-center">
             <span className="text-[9px] font-bold text-gray-800 uppercase">{pengaturan.namaSekolah}</span>
             <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">Database Online Ready</span>
             </div>
          </div>

          <div className="flex gap-3 no-print">
            <button 
              onClick={saveToCloud}
              disabled={isSyncing}
              className="bg-[#2D60E1] text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ SIMPAN CLOUD</>}
            </button>
            <button 
              onClick={loadFromCloud}
              disabled={isSyncing}
              className="bg-[#F87621] text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? <div className="loader !w-3 !h-3" /> : <>☁️ MUAT ULANG</>}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center my-12">
        <h2 className="text-[44px] font-black text-[#1F2937] tracking-tight leading-none uppercase">
          MANAJEMEN GURU MAPEL
        </h2>
      </div>

      <div className="bg-white shadow-sm rounded-full p-1.5 mb-8 flex justify-center gap-1 border border-gray-50 no-print max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
        <NavItem id="jurnal" label="Jurnal" />
        <NavItem id="absensi" label="Absensi" />
        <NavItem id="guru-wali" label="Guru Wali" />
        <NavItem id="laporan" label="Laporan" />
        <NavItem id="murid" label="Siswa" />
        <NavItem id="kelas" label="Kelas" />
        <NavItem id="pengaturan" label="Pengaturan" />
      </div>

      <div className="animate-fade-in pb-12">
        {activeTab === 'jurnal' && <JurnalTab pengaturan={pengaturan} jurnalData={jurnalData} setJurnalData={setJurnalData} kelasData={kelasData} jamData={jamData} showNotification={showNotification} />}
        {activeTab === 'absensi' && <AbsensiTab absensiData={absensiData} setAbsensiData={setAbsensiData} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'guru-wali' && <GuruWaliTab pengaturan={pengaturan} waliData={waliData} setWaliData={setWaliData} showNotification={showNotification} />}
        {activeTab === 'laporan' && <LaporanTab jurnalData={jurnalData} absensiData={absensiData} pengaturan={pengaturan} waliData={waliData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'murid' && <SiswaTab siswaData={siswaData} setSiswaData={setSiswaData} kelasData={kelasData} showNotification={showNotification} forceLoadDefault={forceLoadDefault} />}
        {activeTab === 'kelas' && <KelasTab kelasData={kelasData} setKelasData={setKelasData} jamData={jamData} setJamData={setJamData} showNotification={showNotification} />}
        {activeTab === 'pengaturan' && <PengaturanTab pengaturan={pengaturan} setPengaturan={setPengaturan} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
      </div>

      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-8 py-3 rounded-full shadow-2xl z-[100] font-bold text-sm border border-white/10 animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
};

export default App;
