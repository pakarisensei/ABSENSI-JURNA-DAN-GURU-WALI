
import React, { useState, useEffect } from 'react';
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

  // --- Persistence to LocalStorage ---
  useEffect(() => { localStorage.setItem('pengaturanData', JSON.stringify(pengaturan)); }, [pengaturan]);
  useEffect(() => { localStorage.setItem('jurnalData', JSON.stringify(jurnalData)); }, [jurnalData]);
  useEffect(() => { localStorage.setItem('absensiData', JSON.stringify(absensiData)); }, [absensiData]);
  useEffect(() => { localStorage.setItem('siswaData', JSON.stringify(siswaData)); }, [siswaData]);
  useEffect(() => { localStorage.setItem('kelasData', JSON.stringify(kelasData)); }, [kelasData]);
  useEffect(() => { localStorage.setItem('jamData', JSON.stringify(jamData)); }, [jamData]);
  useEffect(() => { localStorage.setItem('waliData', JSON.stringify(waliData)); }, [waliData]);

  // --- Auto Sync from Cloud on Mount ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await cloudSync.load();
        if (data && data.pengaturan) {
          setPengaturan(data.pengaturan);
          if (data.jurnalData) setJurnalData(data.jurnalData);
          if (data.absensiData) setAbsensiData(data.absensiData);
          if (data.siswaData) setSiswaData(data.siswaData);
          if (data.kelasData) setKelasData(data.kelasData);
          if (data.jamData) setJamData(data.jamData);
          if (data.waliData) setWaliData(data.waliData);
          console.log("Data synced from Cloud successfully");
        }
      } catch (e) {
        console.error("Auto-sync failed:", e);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const showNotification = (message: string) => setNotification({ message, show: true });

  const handleCloudSync = async () => {
    setIsSyncing(true);
    const allData = { pengaturan, jurnalData, absensiData, siswaData, kelasData, jamData, waliData };
    try {
      await cloudSync.save(allData);
      showNotification("✅ Berhasil Sinkron ke Cloud!");
    } catch (e) {
      showNotification("❌ Gagal Sinkron. Periksa koneksi internet atau URL Script.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    setIsSyncing(true);
    try {
      const data = await cloudSync.load();
      if (data && data.pengaturan) {
        setPengaturan(data.pengaturan);
        if (data.jurnalData) setJurnalData(data.jurnalData);
        if (data.absensiData) setAbsensiData(data.absensiData);
        if (data.siswaData) setSiswaData(data.siswaData);
        if (data.kelasData) setKelasData(data.kelasData);
        if (data.jamData) setJamData(data.jamData);
        if (data.waliData) setWaliData(data.waliData);
        showNotification("✅ Data berhasil dimuat dari Cloud!");
      } else {
        showNotification("ℹ️ Cloud kosong atau data tidak ditemukan.");
      }
    } catch (e) {
      showNotification("❌ Gagal memuat data Cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4">
        <div className="loader w-12 h-12 border-teal-600 border-t-transparent mb-4"></div>
        <h2 className="text-xl font-bold text-teal-800 animate-pulse">Menyinkronkan Data Cloud...</h2>
        <p className="text-teal-600 text-sm mt-2">Mohon tunggu sejenak, sedang mengambil data terbaru.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 no-print z-40">
        <button onClick={handleCloudSync} disabled={isSyncing} className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-2 group">
          {isSyncing ? <div className="loader" /> : <span className="group-hover:scale-110 transition">☁️</span>}
          <span className="hidden md:inline font-bold">Simpan Cloud</span>
        </button>
        <button onClick={handleLoadFromCloud} disabled={isSyncing} className="bg-orange-500 text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 transition-all flex items-center gap-2 group">
          {isSyncing ? <div className="loader" /> : <span className="group-hover:scale-110 transition">📥</span>}
          <span className="hidden md:inline font-bold">Refresh Cloud</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-4 border-teal-200 bg-gray-100">
              <img src={pengaturan.foto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800">{pengaturan.nama}</h2>
              <p className="text-sm text-gray-600">NIP: {pengaturan.nip}</p>
              <p className="text-sm text-teal-600 font-semibold">{pengaturan.jabatan}</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="bg-teal-50 px-4 py-2 rounded-lg border border-teal-100">
              <p className="text-sm text-gray-600">{pengaturan.namaSekolah}</p>
              <div className="flex items-center gap-2 justify-center md:justify-end">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="font-semibold text-teal-700 text-xs uppercase tracking-wider">Cloud Synchronized</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center border-t border-gray-200 pt-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight uppercase">MANAJEMEN GURU MAPEL</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-2 mb-6 no-print overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2">
          {['jurnal', 'absensi', 'guru-wali', 'laporan', 'siswa', 'kelas', 'pengaturan'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`capitalize py-2 px-4 font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === tab ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-teal-50'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="transition-opacity duration-300">
        {activeTab === 'jurnal' && <JurnalTab pengaturan={pengaturan} jurnalData={jurnalData} setJurnalData={setJurnalData} kelasData={kelasData} jamData={jamData} showNotification={showNotification} />}
        {activeTab === 'absensi' && <AbsensiTab absensiData={absensiData} setAbsensiData={setAbsensiData} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'guru-wali' && <GuruWaliTab pengaturan={pengaturan} waliData={waliData} setWaliData={setWaliData} showNotification={showNotification} />}
        {activeTab === 'laporan' && <LaporanTab jurnalData={jurnalData} absensiData={absensiData} pengaturan={pengaturan} waliData={waliData} showNotification={showNotification} />}
        {activeTab === 'siswa' && <SiswaTab siswaData={siswaData} setSiswaData={setSiswaData} kelasData={kelasData} showNotification={showNotification} />}
        {activeTab === 'kelas' && <KelasTab kelasData={kelasData} setKelasData={setKelasData} jamData={jamData} setJamData={setJamData} showNotification={showNotification} />}
        {activeTab === 'pengaturan' && <PengaturanTab pengaturan={pengaturan} setPengaturan={setPengaturan} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
      </div>

      <footer className="text-center py-6 mt-8">
        <p className="text-gray-500 text-sm">© 2025 MANAJEMEN GURU MAPEL - {pengaturan.namaSekolah}</p>
      </footer>

      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="font-medium text-gray-800">{notification.message}</p>
            <button onClick={() => setNotification({ ...notification, show: false })} className="mt-6 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
