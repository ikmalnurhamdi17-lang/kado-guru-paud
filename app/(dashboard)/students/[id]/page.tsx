"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Star, Heart, Award, Loader2, Brain, Languages, 
  Music, Sparkles, Flag, Zap, Copy, Check, Save, Calendar, 
  User, Users, ClipboardCheck, CheckCircle2, AlertCircle, XCircle, Info,
  Pencil, Trash2, Activity, X
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';

interface Student {
  id: string;
  name: string;
  avatar_url?: string;
  report_narrative?: string;
  birth_date?: string;
  gender?: string;
  parent_name?: string;
}

interface Observation {
  id: string;
  aspect: string;
  note: string;
  created_at: string;
}

interface AttendanceStats {
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
}

const aspectIcons: Record<string, { icon: any, color: string, bgColor: string }> = {
  'Agama & Moral': { icon: Sparkles, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  'Fisik Motorik': { icon: Flag, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  'Kognitif': { icon: Brain, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'Bahasa': { icon: Languages, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  'Sosial Emosional': { icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  'Seni': { icon: Music, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<Observation[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStats>({ hadir: 0, sakit: 0, izin: 0, alpha: 0 });
  const [loading, setLoading] = useState(true);
  
  const [aiSummary, setAiSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // States untuk Edit Catatan
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchAllData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: studentData } = await supabase.from('students').select('*').eq('id', id).single();
      const { data: obsData } = await supabase.from('observations').select('*').eq('student_id', id).order('created_at', { ascending: false });
      const { data: attData } = await supabase.from('attendance').select('status').eq('student_id', id);

      if (studentData) {
        setStudent(studentData);
        if (studentData.report_narrative) setAiSummary(studentData.report_narrative);
      }
      if (obsData) setHistory(obsData);
      if (attData) {
        const stats = attData.reduce((acc, curr) => {
          if (curr.status === 'Hadir') acc.hadir++;
          else if (curr.status === 'Sakit') acc.sakit++;
          else if (curr.status === 'Izin') acc.izin++;
          else if (curr.status === 'Alpha') acc.alpha++;
          return acc;
        }, { hadir: 0, sakit: 0, izin: 0, alpha: 0 });
        setAttendance(stats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const handleDeleteObservation = async (obsId: string) => {
    Swal.fire({
      title: 'Hapus Catatan?',
      text: "Momen berharga ini akan hilang dari riwayat, Bu Shifa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-[35px]', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from('observations').delete().eq('id', obsId);
        if (!error) {
          setHistory(history.filter(item => item.id !== obsId));
          Swal.fire({ title: 'Terhapus', icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[30px]' } });
        } else {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
        }
      }
    });
  };

  const handleUpdateObservation = async (obsId: string) => {
    const { error } = await supabase.from('observations').update({ note: editValue }).eq('id', obsId);
    if (!error) {
      setHistory(history.map(item => item.id === obsId ? { ...item, note: editValue } : item));
      setEditingId(null);
      Swal.fire({
        title: 'Diperbarui!',
        text: 'Catatan berhasil diperbaiki ✨',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[30px]' }
      });
    } else {
      Swal.fire('Gagal!', 'Tidak bisa menyimpan perubahan.', 'error');
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} Tahun`;
  };

  const generateAiRapor = async () => {
    if (history.length === 0) {
      Swal.fire({ title: 'Belum Ada Data', text: 'Ibu perlu mencatat observasi dulu untuk merangkum.', icon: 'info', customClass: { popup: 'rounded-[30px]' } });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: student?.name, observations: history }),
      });
      const data = await response.json();
      if (data.summary) setAiSummary(data.summary);
    } catch (err: any) {
      Swal.fire('Gagal Generate', err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToProfile = async () => {
    if (!aiSummary) return;
    setIsSaving(true);
    try {
      await supabase.from('students').update({ report_narrative: aiSummary }).eq('id', id);
      Swal.fire({
        title: 'Tersimpan!',
        text: 'Narasi rapor telah diamankan di profil murid.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[30px]' }
      });
    } catch (err) {
      Swal.fire('Gagal Simpan', 'Koneksi bermasalah.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center">
      <Loader2 className="animate-spin text-slate-900 mb-4" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Profil...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-32 text-slate-800 tracking-tight">
      
      {/* 1. Header & Avatar */}
      <div className="bg-white px-6 pt-14 pb-8 rounded-b-[50px] shadow-sm border-b border-slate-50 relative">
        <button onClick={() => router.back()} className="absolute left-6 top-14 p-2.5 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl mb-4">
            {student?.avatar_url ? (
              <img src={student.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                <User size={40} />
              </div>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{student?.name}</h1>
          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-1 bg-indigo-50 px-3 py-1 rounded-full">Akademik Murid</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* 2. Statistik Absensi */}
        <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[16px] font-black text-emerald-500">{attendance.hadir}</span>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Hadir</span>
          </div>
          <div className="w-px h-8 bg-slate-50"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[16px] font-black text-amber-500">{attendance.sakit}</span>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Sakit</span>
          </div>
          <div className="w-px h-8 bg-slate-50"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[16px] font-black text-blue-500">{attendance.izin}</span>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Izin</span>
          </div>
          <div className="w-px h-8 bg-slate-50"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[16px] font-black text-rose-500">{attendance.alpha}</span>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Alpha</span>
          </div>
        </div>

        {/* 3. Tombol Generate AI */}
        <button 
          onClick={generateAiRapor}
          disabled={isGenerating}
          className="w-full bg-slate-900 text-white py-4 rounded-[25px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-400" />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Rangkum Narasi Rapor</span>
        </button>

        {/* 4. Biodata Mini */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
               <Info size={16} />
             </div>
             <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identitas Murid</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-2">
              <span className="font-bold text-slate-400 uppercase tracking-tighter">Lahir :</span>
              <span className="font-black text-slate-800">{student?.birth_date ? new Date(student.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-2">
              <span className="font-bold text-slate-400 uppercase tracking-tighter">Usia :</span>
              <span className="font-black text-slate-800">{calculateAge(student?.birth_date)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-tighter">Wali :</span>
              <span className="font-black text-slate-800">{student?.parent_name || '-'}</span>
            </div>
          </div>
        </div>

        {/* 5. Hasil Narasi AI */}
        <div className="bg-slate-900 p-6 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">AI Narrative Reference</span>
                </div>
                <button onClick={saveToProfile} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="text-indigo-300" />}
                </button>
            </div>
            <textarea 
                className="w-full h-32 bg-transparent text-white/90 text-xs leading-relaxed font-medium border-none focus:ring-0 resize-none scrollbar-hide italic"
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                placeholder="Ketuk 'Rangkum' di atas untuk membuat narasi otomatis..."
            />
        </div>

        {/* 6. Riwayat Catatan Belajar */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck size={18} className="text-indigo-500" />
              Jejak Belajar
            </h2>
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
                <span className="text-[8px] font-black text-indigo-500 uppercase">{history.length} Entri</span>
            </div>
          </div>

          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((obs) => {
                const aspectData = aspectIcons[obs.aspect] || { icon: Award, color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
                const isEditing = editingId === obs.id;

                return (
                  <div key={obs.id} className="bg-white p-5 rounded-[35px] border border-slate-50 shadow-sm flex flex-col gap-4 group">
                    <div className="flex gap-4">
                      <div className={`${aspectData.bgColor} ${aspectData.color} w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-inner`}>
                        <aspectData.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${aspectData.color}`}>{obs.aspect}</p>
                            <p className="text-[9px] text-slate-300 font-bold uppercase mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(obs.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                             <button 
                               onClick={() => { setEditingId(obs.id); setEditValue(obs.note); }} 
                               className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all"
                             >
                                <Pencil size={14} />
                             </button>
                             <button 
                               onClick={() => handleDeleteObservation(obs.id)} 
                               className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="mt-4 space-y-3">
                             <textarea 
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
                             />
                             <div className="flex gap-2">
                                <button onClick={() => handleUpdateObservation(obs.id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Save size={12} className="text-indigo-400" /> Simpan
                                </button>
                                <button onClick={() => setEditingId(null)} className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                  <X size={12} /> Batal
                                </button>
                             </div>
                          </div>
                        ) : (
                          <p className="text-[12px] text-slate-600 font-medium leading-relaxed mt-3 border-l-2 border-slate-50 pl-4 italic">
                            "{obs.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
                <Activity className="mx-auto text-slate-200 mb-4" size={40} />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Belum Ada Rekaman Jejak</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}