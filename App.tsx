
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Data Murid AP Bapak Ariansyah Imran
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
    if (saved && saved !== '{}' && saved !== 'null') return JSON.parse(saved);
    return {
      nama: "Ariansyah Imran, S.Pd.,Gr",
      nip: "199002082022211011",
      jabatan: "Guru PJOK",
      mapel: "PJOK",
      waliKelas: [],
      siswaBinaan: [],
      foto: "data:image/jpeg;base64,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",
      namaSekolah: "UPT SMKN 4 SINJAI",
      namaKepsek: "",
      nipKepsek: ""
    };
  });

  const [jurnalData, setJurnalData] = useState<JurnalData>(() => JSON.parse(localStorage.getItem('jurnalData') || '{}'));
  const [absensiData, setAbsensiData] = useState<AbsensiData>(() => JSON.parse(localStorage.getItem('absensiData') || '{}'));
  
  const [siswaData, setSiswaData] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('siswaData');
    if (saved && saved !== '{}' && saved !== 'null') return JSON.parse(saved);
    return initialMuridData;
  });

  const [kelasData, setKelasData] = useState<string[]>(() => {
    const saved = localStorage.getItem('kelasData');
    if (saved && saved !== '[]' && saved !== 'null') return JSON.parse(saved);
    return initialKelasData;
  });

  const [jamData, setJamData] = useState<string[]>(() => JSON.parse(localStorage.getItem('jamData') || '["1-2","3-5"]'));
  const [waliData, setWaliData] = useState<WaliRecord[]>(() => JSON.parse(localStorage.getItem('waliData') || '[]'));
  
  const [activeTab, setActiveTab] = useState<TabType>('jurnal');
  const [notification, setNotification] = useState({ message: '', show: false });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const isReady = useRef(false);

  useEffect(() => {
    if (!isReady.current) return;
    localStorage.setItem('pengaturanData', JSON.stringify(pengaturan));
    localStorage.setItem('jurnalData', JSON.stringify(jurnalData));
    localStorage.setItem('absensiData', JSON.stringify(absensiData));
    localStorage.setItem('siswaData', JSON.stringify(siswaData));
    localStorage.setItem('kelasData', JSON.stringify(kelasData));
    localStorage.setItem('jamData', JSON.stringify(jamData));
    localStorage.setItem('waliData', JSON.stringify(waliData));
  }, [pengaturan, jurnalData, absensiData, siswaData, kelasData, jamData, waliData]);

  const applyData = useCallback((data: any) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      if (data.pengaturan) setPengaturan(data.pengaturan);
      if (data.jurnalData) setJurnalData(data.jurnalData);
      if (data.absensiData) setAbsensiData(data.absensiData);
      if (data.siswaData) setSiswaData(data.siswaData);
      if (data.kelasData) setKelasData(data.kelasData);
      if (data.jamData) setJamData(data.jamData);
      if (data.waliData) setWaliData(data.waliData);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const syncStartup = async () => {
      try {
        const cloudData = await cloudSync.load();
        if (cloudData && Object.keys(cloudData).length > 0) {
          applyData(cloudData);
        }
      } catch (e) {
        console.error("Gagal sinkronisasi awal:", e);
      } finally {
        isReady.current = true;
        setIsInitialLoading(false);
      }
    };
    syncStartup();
  }, [applyData]);

  const showNotification = (message: string) => setNotification({ message, show: true });

  const handleCloudSave = async () => {
    setIsSyncing(true);
    // Seluruh data termasuk siswaData dikirim ke Cloud (Google Sheets)
    const allData = { pengaturan, jurnalData, absensiData, siswaData, kelasData, jamData, waliData };
    try {
      await cloudSync.save(allData);
      showNotification("✅ Data (termasuk Murid) berhasil dikirim ke Cloud!");
    } catch (e) {
      showNotification("❌ Gagal menyimpan.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudReload = async () => {
    setIsSyncing(true);
    try {
      const data = await cloudSync.load();
      if (applyData(data)) {
        showNotification("✅ Data terbaru dimuat dari Cloud.");
      } else {
        showNotification("ℹ️ Cloud Kosong.");
      }
    } catch (e) {
      showNotification("❌ Gagal memuat Cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  const forceLoadDefaultMurid = () => {
    setSiswaData(initialMuridData);
    setKelasData(initialKelasData);
    showNotification("✅ Database Murid di-reset ke data Bapak.");
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="loader w-14 h-14 border-teal-600 border-t-transparent mb-6"></div>
        <h2 className="text-2xl font-bold text-teal-800 animate-pulse uppercase">Sinkronisasi Cloud...</h2>
        <p className="text-teal-600 text-xs mt-3 font-bold tracking-widest uppercase">Memuat Data Bapak Ariansyah</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:max-w-6xl">
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-bl-full -z-10 opacity-40"></div>
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-xl border-4 border-white ring-4 ring-teal-50">
              <img src={pengaturan.foto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight leading-none">{pengaturan.nama}</h2>
              <p className="text-gray-500 font-medium text-sm mt-1">NIP. {pengaturan.nip}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-teal-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{pengaturan.jabatan}</span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-3 no-print">
            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-center md:text-right">
              <p className="text-gray-800 font-black text-xs uppercase tracking-tight">{pengaturan.namaSekolah}</p>
              <div className="flex items-center gap-2 justify-center md:justify-end mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <p className="font-bold text-[9px] text-green-600 tracking-tighter uppercase">Cloud Database Online</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCloudSave} title="Simpan seluruh data ke Google Sheet" disabled={isSyncing} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-md shadow-blue-100 active:scale-95 disabled:opacity-50">
                {isSyncing ? <div className="loader !w-3 !h-3" /> : <span>☁️</span>} SIMPAN CLOUD
              </button>
              <button onClick={handleCloudReload} title="Ambil data terakhir dari Google Sheet" disabled={isSyncing} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-md shadow-orange-100 active:scale-95 disabled:opacity-50">
                {isSyncing ? <div className="loader !w-3 !h-3" /> : <span>📥</span>} MUAT ULANG
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase md:text-5xl leading-none">MANAJEMEN GURU MAPEL</h1>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md sticky top-4 z-30 rounded-2xl shadow-lg p-1.5 mb-8 no-print border border-white/50 overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-1.5 min-w-max md:min-w-0">
          {['jurnal', 'absensi', 'guru-wali', 'laporan', 'murid', 'kelas', 'pengaturan'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`capitalize py-2.5 px-5 text-[11px] font-black rounded-xl transition-all duration-300 tracking-wider uppercase ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-100 scale-105' 
                  : 'text-gray-500 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'jurnal' && <JurnalTab pengaturan={pengaturan} jurnalData={jurnalData} setJurnalData={setJurnalData} kelasData={kelasData} jamData={jamData} showNotification={showNotification} />}
        {activeTab === 'absensi' && <AbsensiTab absensiData={absensiData} setAbsensiData={setAbsensiData} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'guru-wali' && <GuruWaliTab pengaturan={pengaturan} waliData={waliData} setWaliData={setWaliData} showNotification={showNotification} />}
        {activeTab === 'laporan' && <LaporanTab jurnalData={jurnalData} absensiData={absensiData} pengaturan={pengaturan} waliData={waliData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'murid' && <SiswaTab siswaData={siswaData} setSiswaData={setSiswaData} kelasData={kelasData} showNotification={showNotification} forceLoadDefault={forceLoadDefaultMurid} />}
        {activeTab === 'kelas' && <KelasTab kelasData={kelasData} setKelasData={setKelasData} jamData={jamData} setJamData={setJamData} showNotification={showNotification} />}
        {activeTab === 'pengaturan' && <PengaturanTab pengaturan={pengaturan} setPengaturan={setPengaturan} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
      </div>

      <footer className="text-center py-12 mt-12">
        <div className="w-16 h-1 bg-teal-200 mx-auto mb-6 rounded-full opacity-50"></div>
        <p className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase">
          @2026 COPYRIGHT · ARIANSYAH IMRAN · {pengaturan.namaSekolah}
        </p>
      </footer>

      {notification.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-all border border-gray-100">
            <div className="text-5xl mb-4">📢</div>
            <p className="text-lg font-bold text-gray-800 leading-tight mb-8">{notification.message}</p>
            <button 
              onClick={() => setNotification({ ...notification, show: false })} 
              className="w-full bg-teal-600 text-white py-4 rounded-2xl hover:bg-teal-700 transition font-black shadow-xl shadow-teal-100 active:scale-95 text-xs tracking-widest uppercase"
            >
              OKE, MENGERTI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
