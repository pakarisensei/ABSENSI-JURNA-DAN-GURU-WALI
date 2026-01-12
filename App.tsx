
import React, { useState, useEffect, useCallback } from 'react';
import { 
  PengaturanData, 
  JurnalData, 
  AbsensiData, 
  TabType, 
  WaliRecord,
  SiswaBinaan
} from './types';
import { formatTanggal, formatHariTanggal } from './utils';
import { generateLessonPlan as callGemini } from './geminiService';
import JurnalTab from './components/JurnalTab';
import AbsensiTab from './components/AbsensiTab';
import GuruWaliTab from './components/GuruWaliTab';
import LaporanTab from './components/LaporanTab';
import SiswaTab from './components/SiswaTab';
import KelasTab from './components/KelasTab';
import PengaturanTab from './components/PengaturanTab';

const App: React.FC = () => {
  // --- Initialization Logic ---
  const [pengaturan, setPengaturan] = useState<PengaturanData>(() => {
    const saved = localStorage.getItem('pengaturanData');
    return saved ? JSON.parse(saved) : {
      nama: 'Ariansyah Imran, S.Pd.,Gr',
      nip: '198505152010011001',
      jabatan: 'Guru PJOK',
      mapel: 'PJOK',
      waliKelas: ['XI 2 SMANSA', 'XI 1 SMANSA'],
      siswaBinaan: [],
      foto: 'https://picsum.photos/200/200',
      namaSekolah: 'SMAN 1 SMANSA',
      namaKepsek: 'Nama Kepala Sekolah, S.Pd., M.Pd.',
      nipKepsek: '197001012000011001'
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

  const [siswaData, setSiswaData] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('siswaData');
    return saved ? JSON.parse(saved) : {
      "XI 1 SMANSA": ["Siswa A", "Siswa B"],
      "XI 2 SMANSA": ["Siswa C", "Siswa D"]
    };
  });

  const [kelasData, setKelasData] = useState<string[]>(() => {
    const saved = localStorage.getItem('kelasData');
    return saved ? JSON.parse(saved) : ["XI 1 SMANSA", "XI 2 SMANSA"];
  });

  const [jamData, setJamData] = useState<string[]>(() => {
    const saved = localStorage.getItem('jamData');
    return saved ? JSON.parse(saved) : ["1-2", "3-4"];
  });

  const [waliData, setWaliData] = useState<WaliRecord[]>(() => {
    const saved = localStorage.getItem('waliData');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<TabType>('jurnal');
  const [notification, setNotification] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('pengaturanData', JSON.stringify(pengaturan)); }, [pengaturan]);
  useEffect(() => { localStorage.setItem('jurnalData', JSON.stringify(jurnalData)); }, [jurnalData]);
  useEffect(() => { localStorage.setItem('absensiData', JSON.stringify(absensiData)); }, [absensiData]);
  useEffect(() => { localStorage.setItem('siswaData', JSON.stringify(siswaData)); }, [siswaData]);
  useEffect(() => { localStorage.setItem('kelasData', JSON.stringify(kelasData)); }, [kelasData]);
  useEffect(() => { localStorage.setItem('jamData', JSON.stringify(jamData)); }, [jamData]);
  useEffect(() => { localStorage.setItem('waliData', JSON.stringify(waliData)); }, [waliData]);

  const showNotification = (message: string) => {
    setNotification({ message, show: true });
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
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
              <p className="font-semibold text-teal-700">Jurnal, Daftar Hadir & Wali</p>
            </div>
          </div>
        </div>
        <div className="text-center border-t border-gray-200 pt-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SISTEM MANAJEMEN GURU</h1>
          <p className="text-gray-600">Mata Pelajaran: {pengaturan.mapel}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6 no-print overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2">
          {[
            { id: 'jurnal', label: '📝 Jurnal' },
            { id: 'absensi', label: '✅ Absensi' },
            { id: 'guru-wali', label: '🧑‍🏫 Wali' },
            { id: 'laporan', label: '📊 Laporan' },
            { id: 'siswa', label: '👥 Siswa' },
            { id: 'kelas', label: '🏫 Kelas' },
            { id: 'pengaturan', label: '⚙️ Pengaturan' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-shrink-0 py-2 px-4 text-center font-medium rounded-lg transition-all duration-300 ${
                activeTab === tab.id ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-teal-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-opacity duration-300">
        {activeTab === 'jurnal' && (
          <JurnalTab 
            pengaturan={pengaturan} 
            jurnalData={jurnalData} 
            setJurnalData={setJurnalData} 
            kelasData={kelasData} 
            jamData={jamData} 
            showNotification={showNotification}
          />
        )}
        {activeTab === 'absensi' && (
          <AbsensiTab 
            absensiData={absensiData} 
            setAbsensiData={setAbsensiData} 
            kelasData={kelasData} 
            siswaData={siswaData}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'guru-wali' && (
          <GuruWaliTab 
            pengaturan={pengaturan}
            waliData={waliData}
            setWaliData={setWaliData}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'laporan' && (
          <LaporanTab 
            jurnalData={jurnalData} 
            absensiData={absensiData} 
            pengaturan={pengaturan}
            waliData={waliData}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'siswa' && (
          <SiswaTab 
            siswaData={siswaData} 
            setSiswaData={setSiswaData} 
            kelasData={kelasData}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'kelas' && (
          <KelasTab 
            kelasData={kelasData} 
            setKelasData={setKelasData} 
            jamData={jamData} 
            setJamData={setJamData}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'pengaturan' && (
          <PengaturanTab 
            pengaturan={pengaturan} 
            setPengaturan={setPengaturan} 
            kelasData={kelasData}
            siswaData={siswaData}
            showNotification={showNotification}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mx-4 sm:mx-6">
          <p className="text-gray-600 text-sm">
            © 2025 <strong>@pakarisensei</strong> - Sistem Jurnal & Daftar hadir dan Guru Wali
          </p>
        </div>
      </footer>

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <p className="text-base font-medium text-gray-800 whitespace-pre-wrap">{notification.message}</p>
            <button 
              onClick={closeNotification} 
              className="mt-6 w-full bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
