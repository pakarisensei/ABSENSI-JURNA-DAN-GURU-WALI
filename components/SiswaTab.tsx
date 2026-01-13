
import React, { useState, useMemo } from 'react';

interface SiswaTabProps {
  siswaData: Record<string, string[]>;
  setSiswaData: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  kelasData: string[];
  showNotification: (msg: string) => void;
  forceLoadDefault?: () => void;
}

const SiswaTab: React.FC<SiswaTabProps> = ({ 
  siswaData, 
  setSiswaData, 
  kelasData, 
  showNotification,
  forceLoadDefault
}) => {
  const [newSiswa, setNewSiswa] = useState({ nama: '', kelas: '' });
  const [filter, setFilter] = useState('');
  const [editingSiswa, setEditingSiswa] = useState<{ kelas: string, oldNama: string, newNama: string } | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const namaBersih = newSiswa.nama.trim();
    const kelasTerpilih = newSiswa.kelas;

    if (!namaBersih || !kelasTerpilih) {
      showNotification("⚠️ Nama dan Kelas harus diisi!");
      return;
    }

    setSiswaData(prev => {
      const list = prev[kelasTerpilih] || [];
      // Cek duplikasi
      if (list.some(n => n.toLowerCase() === namaBersih.toLowerCase())) {
        showNotification("⚠️ Nama murid sudah ada di kelas ini!");
        return prev;
      }
      
      const updatedData = { 
        ...prev, 
        [kelasTerpilih]: [...list, namaBersih].sort((a, b) => a.localeCompare(b)) 
      };
      
      // Memberikan feedback sukses
      showNotification(`✅ ${namaBersih} berhasil ditambahkan ke ${kelasTerpilih}`);
      return updatedData;
    });

    // Reset form
    setNewSiswa({ nama: '', kelas: kelasTerpilih }); // Biarkan kelas tetap terpilih untuk input beruntun
  };

  const removeSiswa = (kelas: string, nama: string) => {
    if (confirm(`Hapus murid ${nama} dari kelas ${kelas}?`)) {
      setSiswaData(prev => {
        const list = (prev[kelas] || []).filter(n => n !== nama);
        const newState = { ...prev };
        if (list.length === 0) {
          delete newState[kelas];
        } else {
          newState[kelas] = list;
        }
        return newState;
      });
      showNotification("🗑️ Murid telah dihapus.");
    }
  };

  const handleUpdateSiswa = () => {
    if (!editingSiswa || !editingSiswa.newNama.trim()) return;
    
    const namaBaru = editingSiswa.newNama.trim();

    setSiswaData(prev => {
      const list = prev[editingSiswa.kelas] || [];
      // Cek jika nama baru sudah dipakai orang lain di kelas yang sama
      if (list.some(n => n.toLowerCase() === namaBaru.toLowerCase() && n !== editingSiswa.oldNama)) {
        showNotification("⚠️ Nama sudah digunakan murid lain!");
        return prev;
      }

      const updatedList = list.map(n => n === editingSiswa.oldNama ? namaBaru : n);
      return { 
        ...prev, 
        [editingSiswa.kelas]: updatedList.sort((a, b) => a.localeCompare(b)) 
      };
    });
    
    showNotification("✅ Nama murid berhasil diubah.");
    setEditingSiswa(null);
  };

  const classesToShow = useMemo(() => {
    if (filter) return [filter];
    return Object.keys(siswaData).sort();
  }, [filter, siswaData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="bg-teal-100 p-2 rounded-xl text-xl">👥</span>
          Daftar Seluruh Murid
        </h2>
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
           <p className="text-[10px] font-bold text-amber-700 uppercase leading-tight">
             💡 Info: Setelah menambah murid, jangan lupa tekan tombol <span className="text-blue-600">SIMPAN CLOUD</span> di atas.
           </p>
        </div>
      </div>
      
      <form onSubmit={handleAdd} className="bg-teal-50/50 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 border border-teal-100 shadow-inner">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-teal-600 uppercase ml-1">Nama Murid</label>
          <input 
            placeholder="Ketik nama lengkap..." 
            value={newSiswa.nama} 
            onChange={e => setNewSiswa({...newSiswa, nama: e.target.value})} 
            className="p-3 border-none rounded-xl focus:ring-2 focus:ring-teal-500 shadow-sm" 
            required 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-teal-600 uppercase ml-1">Kelas</label>
          <select 
            value={newSiswa.kelas} 
            onChange={e => setNewSiswa({...newSiswa, kelas: e.target.value})} 
            className="p-3 border-none rounded-xl focus:ring-2 focus:ring-teal-500 shadow-sm font-bold text-gray-700" 
            required
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasData.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-black hover:bg-teal-700 transition uppercase text-[10px] tracking-widest shadow-md active:scale-95">
            + TAMBAH MURID
          </button>
        </div>
      </form>

      <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">Tampilkan Kelas:</label>
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => setFilter('')} 
             className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${!filter ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
           >
             Semua
           </button>
           {kelasData.map(k => (
             <button 
               key={k} 
               onClick={() => setFilter(k)} 
               className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filter === k ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
             >
               {k}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-6 min-h-[300px]">
        {classesToShow.length > 0 ? (
          classesToShow.map(k => (
            <div key={k} className="border p-6 rounded-3xl bg-white shadow-sm border-gray-100 animate-fade-in">
              <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                <h4 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="text-teal-500">🏫</span> Kelas {k}
                </h4>
                <span className="text-[10px] font-black bg-teal-50 text-teal-600 px-4 py-1.5 rounded-full border border-teal-100 uppercase tracking-tighter">
                  {siswaData[k]?.length || 0} Siswa Terdaftar
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(siswaData[k] || []).map(s => (
                  <div key={s} className="group relative">
                    {editingSiswa?.oldNama === s && editingSiswa?.kelas === k ? (
                      <div className="flex items-center gap-2 bg-white border-2 border-blue-400 p-1 px-2 rounded-xl shadow-lg z-10">
                        <input 
                          autoFocus
                          value={editingSiswa.newNama}
                          onChange={e => setEditingSiswa({...editingSiswa, newNama: e.target.value})}
                          className="text-xs p-1.5 border-none focus:ring-0 w-32 font-bold"
                        />
                        <button onClick={handleUpdateSiswa} className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">✓</button>
                        <button onClick={() => setEditingSiswa(null)} className="bg-gray-200 text-gray-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold">×</button>
                      </div>
                    ) : (
                      <span className="bg-white hover:bg-teal-50 border border-gray-200 px-4 py-2 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-4 transition-all hover:shadow-sm hover:border-teal-200 group">
                        {s}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingSiswa({ kelas: k, oldNama: s, newNama: s })} 
                            className="text-blue-400 hover:text-blue-600 transition p-1"
                            title="Edit Nama"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => removeSiswa(k, s)} 
                            className="text-red-300 hover:text-red-500 font-bold transition p-1"
                            title="Hapus Murid"
                          >
                            ×
                          </button>
                        </div>
                      </span>
                    )}
                  </div>
                ))}
                {(siswaData[k] || []).length === 0 && <p className="text-[10px] text-gray-300 italic">Belum ada murid di kelas ini.</p>}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4 opacity-20">📂</div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Daftar murid kosong.</p>
          </div>
        )}
      </div>

      {forceLoadDefault && (
        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-4">Pemulihan Data Standar</p>
            <button 
              onClick={() => {
                if(confirm("Tindakan ini akan menimpa seluruh daftar murid saat ini dengan data bawaan AP Bapak. Lanjutkan?")) {
                  forceLoadDefault();
                }
              }}
              className="w-full text-[10px] font-black tracking-widest uppercase border-2 border-orange-200 text-orange-500 px-6 py-4 rounded-2xl hover:bg-orange-50 transition active:scale-95 shadow-sm"
            >
              📥 RESET KE DATA MURID BAWAAN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiswaTab;
