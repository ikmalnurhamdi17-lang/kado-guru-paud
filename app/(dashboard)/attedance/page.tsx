"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar, Save, User, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [date, setDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setDate(dateStr);
    
    async function initData() {
      setLoading(true);
      try {
        // 1. Cek status absensi hari ini
        const { data: existingData } = await supabase
          .from('attendance')
          .select('id')
          .eq('date', dateStr)
          .limit(1);

        if (existingData && existingData.length > 0) {
          setIsAlreadySaved(true);
        }

        // 2. Ambil data murid dengan foto dioptimasi
        const { data: studentData } = await supabase
          .from('students')
          .select('id, name, avatar_url')
          .order('name', { ascending: true });

        if (studentData) {
          setStudents(studentData.map(s => ({ ...s, status: 'Hadir' })));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    if (isAlreadySaved) {
      Swal.fire({
        title: 'Absensi Terkunci',
        text: 'Data hari ini sudah disimpan dan tidak dapat diubah kembali.',
        icon: 'info',
        confirmButtonColor: '#0F172A',
        customClass: { popup: 'rounded-[30px]' }
      });
      return;
    }
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const saveAttendance = async () => {
    if (students.length === 0 || isAlreadySaved) return;

    // Konfirmasi sebelum simpan
    Swal.fire({
      title: 'Simpan Absensi?',
      text: "Pastikan data kehadiran sudah benar ya, Bu Shifa.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0F172A',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Cek Lagi',
      customClass: { popup: 'rounded-[35px]', confirmButton: 'rounded-2xl px-6 py-3 font-bold', cancelButton: 'rounded-2xl px-6 py-3 font-bold' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSaving(true);
        const attendanceData = students.map(s => ({
          student_id: s.id,
          date: date,
          status: s.status
        }));

        try {
          const { error } = await supabase.from('attendance').insert(attendanceData);
          if (error) throw error;
          
          setIsAlreadySaved(true);
          
          Swal.fire({
            title: 'Alhamdulillah!',
            text: 'Absensi hari ini berhasil tercatat di sistem.',
            icon: 'success',
            confirmButtonColor: '#10B981',
            customClass: { popup: 'rounded-[30px]' }
          });
        } catch (error: any) {
          Swal.fire('Gagal!', error.message, 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const getStatusStyle = (currentStatus: string, targetStatus: string) => {
    const isSelected = currentStatus === targetStatus;
    if (!isSelected) return "bg-slate-50 text-slate-300 border-slate-50 opacity-40";

    switch (targetStatus) {
      case 'Hadir': return "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-100 scale-110";
      case 'Sakit': return "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-100 scale-110";
      case 'Izin': return "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-100 scale-110";
      case 'Alpha': return "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-100 scale-110";
      default: return "bg-slate-50";
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFD]">
      <Loader2 className="animate-spin text-slate-900 mb-4" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membuka Buku Absen...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-32">
      {/* Header Ramping */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-14 pb-6 sticky top-0 z-[100] border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Absensi Murid</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Presensi Harian</p>
            </div>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-200">
            <Calendar size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Notifikasi Status Terkunci */}
      {isAlreadySaved && (
        <div className="mx-6 mt-6 p-4 bg-slate-900 rounded-[28px] flex items-center gap-4 shadow-xl shadow-slate-200 animate-in fade-in zoom-in duration-500">
          <div className="bg-emerald-500 p-2 rounded-xl text-white">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-wide leading-relaxed">
            Absensi hari ini sudah tersimpan & terkunci secara otomatis.
          </p>
        </div>
      )}

      {/* List Murid - Desain Ramping */}
      <div className="p-6 space-y-3">
        {students.map((student) => (
          <div key={student.id} className={`bg-white px-4 py-3 rounded-[28px] border border-slate-50 shadow-sm flex items-center justify-between transition-all ${isAlreadySaved ? 'opacity-70' : 'opacity-100 hover:border-indigo-100'}`}>
            
            <div className="flex items-center gap-4 min-w-0">
               <div className="relative">
                 <div className="w-11 h-11 rounded-2xl bg-slate-50 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                    {student.avatar_url ? (
                      <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-200" />
                    )}
                 </div>
                 {student.status === 'Hadir' && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                        <UserCheck size={8} />
                    </div>
                 )}
               </div>
               <div className="flex flex-col min-w-0">
                 <p className="font-black text-slate-800 text-[13px] truncate tracking-tight leading-none mb-1">{student.name}</p>
                 <p className={`text-[8px] font-black uppercase tracking-widest ${student.status === 'Hadir' ? 'text-emerald-500' : 'text-rose-400'}`}>
                   Status: {student.status}
                 </p>
               </div>
            </div>

            {/* Tombol Pilihan Status Ramping */}
            <div className={`flex gap-1 bg-slate-50/80 p-1 rounded-2xl border border-slate-50 ${isAlreadySaved ? 'pointer-events-none' : ''}`}>
              {[
                { label: 'Hadir', key: 'H' },
                { label: 'Sakit', key: 'S' },
                { label: 'Izin', key: 'I' },
                { label: 'Alpha', key: 'A' }
              ].map((item) => (
                <button
                  key={item.label}
                  disabled={isAlreadySaved}
                  onClick={() => handleStatusChange(student.id, item.label)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-300 border ${getStatusStyle(student.status, item.label)}`}
                >
                  {item.key}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Action Button */}
        <div className="pt-10 pb-20 flex flex-col items-center">
          <button 
            onClick={saveAttendance}
            disabled={saving || students.length === 0 || isAlreadySaved}
            className={`
              px-10 py-4 rounded-[25px] font-black uppercase tracking-[0.2em] text-[11px] 
              transition-all duration-300 flex items-center gap-3 shadow-2xl
              ${isAlreadySaved 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none' 
                : 'bg-slate-900 text-white active:scale-95 shadow-slate-200'
              }
            `}
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isAlreadySaved ? (
              <ShieldCheck size={18} />
            ) : (
              <Save size={18} className="text-indigo-400" />
            )}
            
            {saving ? "Menyimpan..." : isAlreadySaved ? "Akses Terkunci" : "Simpan Kehadiran"}
          </button>
          
          <p className="text-[9px] text-slate-400 mt-5 font-black uppercase tracking-widest opacity-50">
            {isAlreadySaved ? "Laporan Harian Selesai" : "*Pencatatan hanya sekali per hari"}
          </p>
        </div>
      </div>
    </div>
  );
}