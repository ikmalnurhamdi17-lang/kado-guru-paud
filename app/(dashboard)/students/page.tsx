"use client";

import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Loader2, Trash2, Edit2, Eye } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    // Menggunakan select yang lebih spesifik untuk efisiensi data
    const { data, error } = await supabase
      .from('students')
      .select('id, name, avatar_url, gender')
      .order('name', { ascending: true });
    
    if (data) setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // FUNGSI HAPUS DENGAN SWEETALERT2
  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: 'Hapus Murid?',
      text: `Seluruh data dan riwayat ${name} akan hilang permanen, Bu Shifa.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48', // Rose-600
      cancelButtonColor: '#94A3B8', // Slate-400
      confirmButtonText: 'Ya, Hapus Data',
      cancelButtonText: 'Batalkan',
      customClass: {
        popup: 'rounded-[35px]',
        confirmButton: 'rounded-xl px-5 py-3 font-bold',
        cancelButton: 'rounded-xl px-5 py-3 font-bold'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) {
          Swal.fire('Gagal!', error.message, 'error');
        } else {
          setStudents(students.filter(s => s.id !== id));
          Swal.fire({
            title: 'Terhapus!',
            text: `Data ${name} berhasil dibersihkan.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: { popup: 'rounded-[30px]' }
          });
        }
      }
    });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-32 text-slate-800">
      {/* Header Ramping & Elegan */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-14 pb-4 sticky top-0 z-50 border-b border-slate-50">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Data Murid</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manajemen Kelas</p>
          </div>
          <Link href="/students/add">
            <button className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl shadow-slate-200 active:scale-90 transition-all">
              <Plus size={20} />
            </button>
          </Link>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Cari nama murid..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-slate-700 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* List Murid */}
      <div className="p-5 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="animate-spin text-slate-900 mb-4" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Menyinkronkan...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white px-4 py-3 rounded-[28px] border border-slate-50 shadow-sm flex items-center justify-between group transition-all hover:border-indigo-100">
              
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative">
                  {/* Container Foto dengan Efek Halus */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-white shadow-md overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                    {student.avatar_url ? (
                      <img 
                        src={`${student.avatar_url}?width=100&height=100&quality=80`} // Query untuk optimasi sederhana
                        alt={student.name} 
                        className="w-full h-full object-cover"
                        loading="lazy" // Mempercepat pemuatan halaman
                      />
                    ) : (
                      <div className="bg-slate-50 w-full h-full flex items-center justify-center">
                        <User size={20} className="text-slate-200" />
                      </div>
                    )}
                  </div>
                  {/* Gender Badge Minimalis */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center text-[8px] text-white font-black shadow-sm ${student.gender === 'Laki-laki' ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                    {student.gender === 'Laki-laki' ? 'L' : 'P'}
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <p className="font-black text-slate-800 text-[13px] truncate tracking-tight">{student.name}</p>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">
                    {student.gender}
                  </p>
                </div>
              </div>

              {/* Action Buttons Ramping */}
              <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-2xl border border-slate-50">
                <Link href={`/students/${student.id}`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Eye size={16} />
                </Link>
                <Link href={`/students/edit/${student.id}`} className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button 
                  onClick={() => handleDelete(student.id, student.name)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
             <User className="mx-auto text-slate-200 mb-4" size={40} />
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Data murid tidak ditemukan</p>
          </div>
        )}
      </div>

      <div className="text-center py-10 opacity-30">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Ruang Shifa Database</p>
      </div>
    </div>
  );
}