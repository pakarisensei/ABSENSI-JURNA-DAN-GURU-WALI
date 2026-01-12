
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

const App: React.FC = () => {
  // --- States ---
  const [pengaturan, setPengaturan] = useState<PengaturanData>(() => JSON.parse(localStorage.getItem('pengaturanData') || '{"nama":"Ariansyah Imran, S.Pd.,Gr","nip":"199002082022211011","jabatan":"Guru PJOK","mapel":"PJOK","waliKelas":[],"siswaBinaan":[],"foto":"https://picsum.photos/200/200","namaSekolah":"UPT SMKN 4 SINJAI","namaKepsek":"","nipKepsek":""}'));
  const [jurnalData, setJurnalData] = useState<JurnalData>(() => JSON.parse(localStorage.getItem('jurnalData') || '{}'));
  const [absensiData, setAbsensiData] = useState<AbsensiData>(() => JSON.parse(localStorage.getItem('absensiData') || '{}'));
  const [siswaData, setSiswaData] = useState<Record<string, string[]>>(() => JSON.parse(localStorage.getItem('siswaData') || '{}'));
  const [kelasData, setKelasData] = useState<string[]>(() => JSON.parse(localStorage.getItem('kelasData') || '[]'));
  const [jamData, setJamData] = useState<string[]>(() => JSON.parse(localStorage.getItem('jamData') || '["1-2","3-4","5-6"]'));
  const [waliData, setWaliData] = useState<WaliRecord[]>(() => JSON.parse(localStorage.getItem('waliData') || '[]'));
  
  const [activeTab, setActiveTab] = useState<TabType>('jurnal');
  const [notification, setNotification] = useState({ message: '', show: false });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Flag ini mencegah data default menimpa data Cloud saat startup
  const isReady = useRef(false);

  // --- Persistence Logic (Hanya jalan setelah isReady true) ---
  useEffect(() => {
    if (!isReady.current) return;
    
    localStorage.setItem('pengaturanData', JSON.stringify(pengaturan));
    localStorage.setItem('jurnalData', JSON.stringify(jurnalData));
    localStorage.setItem('absensiData', JSON.stringify(absensiData));
    localStorage.setItem('siswaData', JSON.stringify(siswaData));
    localStorage.setItem('kelasData', JSON.stringify(kelasData));
    localStorage.setItem('jamData', JSON.stringify(jamData));
    localStorage.setItem('waliData', JSON.stringify(waliData));
    
    console.log("💾 Data tersimpan ke LocalStorage.");
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

  // --- Startup: Ambil Data dari Cloud ---
  useEffect(() => {
    const syncStartup = async () => {
      try {
        const cloudData = await cloudSync.load();
        if (cloudData && Object.keys(cloudData).length > 0) {
          applyData(cloudData);
          console.log("✅ Data Cloud Berhasil Dimuat Otomatis.");
        } else {
          console.log("ℹ️ Cloud Kosong, menggunakan data lokal.");
        }
      } catch (e) {
        console.error("Gagal sinkronisasi awal:", e);
      } finally {
        isReady.current = true; // Kunci dibuka, aplikasi mulai menyimpan perubahan ke localStorage
        setIsInitialLoading(false);
      }
    };
    syncStartup();
  }, [applyData]);

  const showNotification = (message: string) => setNotification({ message, show: true });

  const handleCloudSave = async () => {
    setIsSyncing(true);
    const allData = { pengaturan, jurnalData, absensiData, siswaData, kelasData, jamData, waliData };
    try {
      await cloudSync.save(allData);
      showNotification("✅ Data berhasil dikirim ke Google Sheets!");
    } catch (e) {
      showNotification("❌ Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudReload = async () => {
    setIsSyncing(true);
    try {
      const data = await cloudSync.load();
      if (applyData(data)) {
        showNotification("✅ Berhasil memuat data terbaru dari Cloud.");
      } else {
        showNotification("ℹ️ Data Cloud tidak ditemukan atau kosong.");
      }
    } catch (e) {
      showNotification("❌ Gagal menghubungi Google Sheets.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4">
        <div className="loader w-14 h-14 border-teal-600 border-t-transparent mb-6"></div>
        <h2 className="text-2xl font-bold text-teal-800 animate-pulse">SINKRONISASI CLOUD...</h2>
        <p className="text-teal-600 text-sm mt-3 font-medium text-center">Tunggu sebentar, kami sedang mengambil data Bapak di Google Sheets.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:max-w-6xl">
      {/* Tombol Aksi Melayang */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 no-print z-50">
        <button 
          onClick={handleCloudSave} 
          disabled={isSyncing} 
          className="bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 active:scale-90 transition-all flex items-center gap-3"
          title="Klik untuk Simpan ke Cloud"
        >
          {isSyncing ? <div className="loader" /> : <span className="text-2xl">☁️</span>}
          <span className="hidden md:inline font-black tracking-wide">SIMPAN CLOUD</span>
        </button>
        <button 
          onClick={handleCloudReload} 
          disabled={isSyncing} 
          className="bg-orange-500 text-white p-5 rounded-full shadow-2xl hover:bg-orange-600 hover:scale-110 active:scale-90 transition-all flex items-center gap-3"
          title="Klik untuk Tarik Data dari Cloud"
        >
          {isSyncing ? <div className="loader" /> : <span className="text-2xl">📥</span>}
          <span className="hidden md:inline font-black tracking-wide">MUAT ULANG</span>
        </button>
      </div>

      {/* Header Profil */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 opacity-50"></div>
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-xl border-4 border-white ring-4 ring-teal-50">
              <img src={pengaturan.foto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{pengaturan.nama}</h2>
              <p className="text-gray-500 font-medium">NIP. {pengaturan.nip}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-full uppercase tracking-widest">{pengaturan.jabatan}</span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 text-center md:text-right">
            <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 inline-block">
              <p className="text-emerald-800 font-bold text-sm uppercase">{pengaturan.namaSekolah}</p>
              <div className="flex items-center gap-2 justify-center md:justify-end mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <p className="font-black text-[10px] text-green-700 tracking-tighter uppercase">Cloud Database Online</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase md:text-5xl">MANAJEMEN GURU MAPEL</h1>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="bg-white/80 backdrop-blur-md sticky top-4 z-30 rounded-2xl shadow-lg p-2 mb-8 no-print border border-white/50 overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2 min-w-max md:min-w-0">
          {['jurnal', 'absensi', 'guru-wali', 'laporan', 'siswa', 'kelas', 'pengaturan'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`capitalize py-3 px-6 font-bold rounded-xl transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 scale-105' 
                  : 'text-gray-500 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Tab */}
      <div className="animate-fade-in">
        {activeTab === 'jurnal' && <JurnalTab pengaturan={pengaturan} jurnalData={jurnalData} setJurnalData={setJurnalData} kelasData={kelasData} jamData={jamData} showNotification={showNotification} />}
        {activeTab === 'absensi' && <AbsensiTab absensiData={absensiData} setAbsensiData={setAbsensiData} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'guru-wali' && <GuruWaliTab pengaturan={pengaturan} waliData={waliData} setWaliData={setWaliData} showNotification={showNotification} />}
        {activeTab === 'laporan' && <LaporanTab jurnalData={jurnalData} absensiData={absensiData} pengaturan={pengaturan} waliData={waliData} showNotification={showNotification} />}
        {activeTab === 'siswa' && <SiswaTab siswaData={siswaData} setSiswaData={setSiswaData} kelasData={kelasData} showNotification={showNotification} />}
        {activeTab === 'kelas' && <KelasTab kelasData={kelasData} setKelasData={setKelasData} jamData={jamData} setJamData={setJamData} showNotification={showNotification} />}
        {activeTab === 'pengaturan' && <PengaturanTab pengaturan={pengaturan} setPengaturan={setPengaturan} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
      </div>

      <footer className="text-center py-12 mt-12">
        <div className="w-16 h-1 bg-teal-200 mx-auto mb-6 rounded-full"></div>
        <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">© 2025 SISTEM INFORMASI GURU - {pengaturan.namaSekolah}</p>
      </footer>

      {/* Pop-up Notifikasi */}
      {notification.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-all border border-gray-100">
            <div className="text-5xl mb-4">📢</div>
            <p className="text-xl font-bold text-gray-800 leading-tight mb-8">{notification.message}</p>
            <button 
              onClick={() => setNotification({ ...notification, show: false })} 
              className="w-full bg-teal-600 text-white py-4 rounded-2xl hover:bg-teal-700 transition font-black shadow-xl shadow-teal-100 active:scale-95"
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
