
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

  // --- Persistence Logic ---
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

  // --- Startup: Ambil Data dari Cloud ---
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
    const allData = { pengaturan, jurnalData, absensiData, siswaData, kelasData, jamData, waliData };
    try {
      await cloudSync.save(allData);
      showNotification("✅ Data berhasil dikirim ke Cloud!");
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
        showNotification("✅ Data terbaru dimuat.");
      } else {
        showNotification("ℹ️ Cloud Kosong.");
      }
    } catch (e) {
      showNotification("❌ Gagal memuat Cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="loader w-14 h-14 border-teal-600 border-t-transparent mb-6"></div>
        <h2 className="text-2xl font-bold text-teal-800 animate-pulse uppercase">Sinkronisasi Cloud...</h2>
        <p className="text-teal-600 text-xs mt-3 font-bold tracking-widest uppercase">Memuat Data Administrasi Bapak</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:max-w-6xl">
      
      {/* Header Profil Terintegrasi dengan Kontrol Cloud */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-bl-full -z-10 opacity-40"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
          
          {/* Sisi Kiri: Foto & Identitas */}
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

          {/* Sisi Kanan: Info Sekolah & Tombol Sinkronisasi Kecil */}
          <div className="flex flex-col items-center md:items-end gap-3 no-print">
            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-center md:text-right">
              <p className="text-gray-800 font-black text-xs uppercase tracking-tight">{pengaturan.namaSekolah}</p>
              <div className="flex items-center gap-2 justify-center md:justify-end mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <p className="font-bold text-[9px] text-green-600 tracking-tighter uppercase">Cloud Database Online</p>
              </div>
            </div>

            {/* Tombol Kontrol Cloud (Kecil & Rapi) */}
            <div className="flex gap-2">
              <button 
                onClick={handleCloudSave} 
                disabled={isSyncing} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-md shadow-blue-100 active:scale-95 disabled:opacity-50"
              >
                {isSyncing ? <div className="loader !w-3 !h-3" /> : <span>☁️</span>}
                SIMPAN CLOUD
              </button>
              <button 
                onClick={handleCloudReload} 
                disabled={isSyncing} 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-md shadow-orange-100 active:scale-95 disabled:opacity-50"
              >
                {isSyncing ? <div className="loader !w-3 !h-3" /> : <span>📥</span>}
                MUAT ULANG
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase md:text-5xl leading-none">MANAJEMEN GURU MAPEL</h1>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="bg-white/90 backdrop-blur-md sticky top-4 z-30 rounded-2xl shadow-lg p-1.5 mb-8 no-print border border-white/50 overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-1.5 min-w-max md:min-w-0">
          {['jurnal', 'absensi', 'guru-wali', 'laporan', 'siswa', 'kelas', 'pengaturan'].map(tab => (
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
        <div className="w-16 h-1 bg-teal-200 mx-auto mb-6 rounded-full opacity-50"></div>
        <p className="text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase">
          © 2026 COPYRIGHT · ARIANSYAH IMRAN · {pengaturan.namaSekolah}
        </p>
      </footer>

      {/* Pop-up Notifikasi */}
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
