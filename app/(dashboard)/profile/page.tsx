"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar, Save, Check, User, AlertTriangle, Search } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState("");
  const [isAlreadyObserved, setIsAlreadyObserved] = useState(false);

  // Fungsi untuk mengecek apakah tanggal sudah diabsen
  const checkAttendanceByDate = async (selectedDate: string) => {
    if (!selectedDate) return;
    
    setChecking(true);
    setIsAlreadyObserved(false);
    setStudents([]);

    try {
      // 1. Cek apakah di tabel attendance sudah ada data untuk tanggal ini
      const { data: existingData, error: checkError } = await supabase
        .from('attendance')
        .select('id')
        .eq('date', selectedDate)
        .limit(1);

      if (existingData && existingData.length > 0) {
        setIsAlreadyObserved(true);
        setChecking(false);
        return;
      }

      // 2. Jika belum ada, baru ambil daftar murid
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, name, avatar_url')
        .order('name', { ascending: true });

      if (studentData) {
        setStudents(studentData.map(s => ({ ...s, status: 'Hadir' })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setChecking(false);
    }
  };

  // Trigger cek saat tanggal berubah
  useEffect(() => {
    if (date) {
      checkAttendanceByDate(date);
    }
  }, [date]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const saveAttendance = async () => {
    if (students.length === 0) return;
    setSaving(true);
    
    const attendanceData = students.map(s => ({
      student_id: s.id,
      date: date,
      status: s.status
    }));

    try {
      const { error } = await supabase.from('attendance').insert(attendanceData);
      if (error) throw error;
      alert("Alhamdulillah, Absensi tanggal " + date + " berhasil disimpan! ✨");
      setIsAlreadyObserved(true); // Kunci kembali setelah simpan
      setStudents([]);
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (currentStatus: string, targetStatus: string) => {
    const isSelected = currentStatus === targetStatus;
    if (!isSelected) return "bg-slate-50 text-slate-300 border-slate-100";
    switch (targetStatus) {
      case 'Hadir': return "bg-emerald-500 text-white border-emerald-400 shadow-sm scale-105";
      case 'Sakit': return "bg-amber-500 text-white border-amber-400 shadow-sm scale-105";
      case 'Izin': return "bg-blue-500 text-white border-blue-400 shadow-sm scale-105";
      case 'Alpha': return "bg-rose-500 text-white border-rose-400 shadow-sm scale-105";
      default: return "bg-slate-50 text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-12 text-slate-800">
      
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-[100] border-b border-slate-100/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl text-slate-400 active:scale-90 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-black tracking-tight">Pengabsenan</h1>
        </div>

        {/* Input Tanggal (Langkah Pertama) */}
        <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 px-1">Pilih Tanggal Absen</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border-none rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading Saat Cek Tanggal */}
        {checking && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mengecek Data...</p>
          </div>
        )}

        {/* Peringatan Jika Sudah Diabsen */}
        {!checking && isAlreadyObserved && (
          <div className="bg-rose-50 p-8 rounded-[40px] border border-rose-100 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-rose-100">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-rose-600 font-black text-lg leading-tight">Ups! Hari Ini<br/>Sudah Diabsen</h2>
            <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
              Data absensi untuk tanggal {date}<br/>sudah tersimpan di database.
            </p>
            <button 
              onClick={() => setDate("")}
              className="mt-6 bg-white text-rose-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-rose-100 active:scale-95 transition-all"
            >
              Pilih Tanggal Lain
            </button>
          </div>
        )}

        {/* Info Jika Tanggal Belum Dipilih */}
        {!checking && !date && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-4">
              <Search size={32} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Silakan pilih tanggal<br/>untuk memulai absen</p>
          </div>
        )}

        {/* Daftar Murid Muncul Hanya Jika Belum Diabsen */}
        {!checking && !isAlreadyObserved && students.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2 mb-2">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Murid ({students.length})</h2>
               <div className="flex items-center gap-1 text-emerald-500 font-bold text-[9px] uppercase">
                 <Check size={12} /> Belum Diabsen
               </div>
            </div>

            {students.map((student) => (
              <div key={student.id} className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100/60 shadow-sm flex items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {student.avatar_url ? (
                      <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate leading-tight">{student.name}</p>
                    <p className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${student.status === 'Hadir' ? 'text-emerald-500' : 'text-rose-500'}`}>{student.status}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 bg-slate-50 p-1 rounded-full border border-slate-100">
                  {['Hadir', 'Sakit', 'Izin', 'Alpha'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(student.id, st)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-200 border ${getStatusStyle(student.status, st)}`}
                    >
                      {st.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-10 px-2 pb-10 text-center">
              <button 
                onClick={saveAttendance}
                disabled={saving}
                className="w-full bg-slate-900 text-white py-4.5 rounded-[25px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "Menyimpan..." : "Simpan Absensi"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}