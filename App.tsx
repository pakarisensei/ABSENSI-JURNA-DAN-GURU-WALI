
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
  // Default values updated for NIP: 199002082022211011 and School: UPT SMKN 4 SINJAI
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

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('pengaturanData', JSON.stringify(pengaturan)); }, [pengaturan]);
  useEffect(() => { localStorage.setItem('jurnalData', JSON.stringify(jurnalData)); }, [jurnalData]);
  useEffect(() => { localStorage.setItem('absensiData', JSON.stringify(absensiData)); }, [absensiData]);
  useEffect(() => { localStorage.setItem('siswaData', JSON.stringify(siswaData)); }, [siswaData]);
  useEffect(() => { localStorage.setItem('kelasData', JSON.stringify(kelasData)); }, [kelasData]);
  useEffect(() => { localStorage.setItem('jamData', JSON.stringify(jamData)); }, [jamData]);
  useEffect(() => { localStorage.setItem('waliData', JSON.stringify(waliData)); }, [waliData]);

  const showNotification = (message: string) => setNotification({ message, show: true });

  const handleCloudSync = async () => {
    setIsSyncing(true);
    const allData = { pengaturan, jurnalData, absensiData, siswaData, kelasData, jamData, waliData };
    try {
      await cloudSync.save(allData);
      showNotification("✅ Berhasil Sinkron ke Cloud!");
    } catch (e) {
      showNotification("❌ Gagal Sinkron. Pastikan URL Script benar.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!confirm("Ambil data dari Cloud? Data lokal akan tertimpa.")) return;
    setIsSyncing(true);
    try {
      const data = await cloudSync.load();
      if (data.pengaturan) setPengaturan(data.pengaturan);
      if (data.jurnalData) setJurnalData(data.jurnalData);
      if (data.absensiData) setAbsensiData(data.absensiData);
      if (data.siswaData) setSiswaData(data.siswaData);
      if (data.kelasData) setKelasData(data.kelasData);
      if (data.jamData) setJamData(data.jamData);
      if (data.waliData) setWaliData(data.waliData);
      showNotification("✅ Data berhasil dimuat dari Cloud!");
    } catch (e) {
      showNotification("❌ Gagal memuat data Cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Tombol Sinkronisasi Floating */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 no-print z-40">
        <button 
          onClick={handleCloudSync}
          disabled={isSyncing}
          className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-2"
          title="Simpan ke Cloud"
        >
          {isSyncing ? <div className="loader" /> : "☁️ Simpan Cloud"}
        </button>
        <button 
          onClick={handleLoadFromCloud}
          disabled={isSyncing}
          className="bg-orange-500 text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 transition-all flex items-center gap-2"
          title="Muat dari Cloud"
        >
          {isSyncing ? <div className="loader" /> : "📥 Muat Cloud"}
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-4 border-teal-200">
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
              <p className="font-semibold text-teal-700">Jurnal & Daftar Hadir (Cloud Enabled)</p>
            </div>
          </div>
        </div>
        <div className="text-center border-t border-gray-200 pt-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SISTEM MANAJEMEN GURU</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6 no-print overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2">
          {['jurnal', 'absensi', 'guru-wali', 'laporan', 'siswa', 'kelas', 'pengaturan'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`capitalize py-2 px-4 font-medium rounded-lg transition ${
                activeTab === tab ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-teal-50'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-opacity duration-300">
        {activeTab === 'jurnal' && <JurnalTab pengaturan={pengaturan} jurnalData={jurnalData} setJurnalData={setJurnalData} kelasData={kelasData} jamData={jamData} showNotification={showNotification} />}
        {activeTab === 'absensi' && <AbsensiTab absensiData={absensiData} setAbsensiData={setAbsensiData} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
        {activeTab === 'guru-wali' && <GuruWaliTab pengaturan={pengaturan} waliData={waliData} setWaliData={setWaliData} showNotification={showNotification} />}
        {activeTab === 'laporan' && <LaporanTab jurnalData={jurnalData} absensiData={absensiData} pengaturan={pengaturan} waliData={waliData} showNotification={showNotification} />}
        {activeTab === 'siswa' && <SiswaTab siswaData={siswaData} setSiswaData={setSiswaData} kelasData={kelasData} showNotification={showNotification} />}
        {activeTab === 'kelas' && <KelasTab kelasData={kelasData} setKelasData={setKelasData} jamData={jamData} setJamData={setJamData} showNotification={showNotification} />}
        {activeTab === 'pengaturan' && <PengaturanTab pengaturan={pengaturan} setPengaturan={setPengaturan} kelasData={kelasData} siswaData={siswaData} showNotification={showNotification} />}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-8">
        <p className="text-gray-500 text-sm">© 2025 @pakarisensei - Terhubung ke Google Cloud</p>
      </footer>

      {/* Notification */}
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
