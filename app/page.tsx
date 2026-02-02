"use client";

import React, { useEffect, useState } from 'react';
import { 
  Users, MessageSquareText, Loader2, Heart, Sparkles, 
  Calendar as CalendarIcon, ArrowRight, Image as ImageIcon, 
  BookOpen, LogOut, Camera 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function MobileDashboard() {
  const router = useRouter();
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [weeklyObservations, setWeeklyObservations] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  
  // State Baru untuk Foto Profil
  const [fotoProfil, setFotoProfil] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Shifa");
  const [uploadingProfil, setUploadingProfil] = useState(false);

  const handleLogout = async () => {
    Swal.fire({
      title: 'Ingin Keluar, Ibu Shifa?',
      text: "Pastikan semua catatan hari ini sudah tersimpan ya ✨",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Kembali',
      customClass: { popup: 'rounded-[35px]' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await supabase.auth.signOut();
        router.push('/login');
      }
    });
  };

  const handleGantiFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingProfil(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `profil-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ruang-shifa')
        .upload(`identitas/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ruang-shifa')
        .getPublicUrl(`identitas/${fileName}`);

      await supabase.from('profil_shifa').upsert({ id: 1, foto_url: publicUrl });
      
      setFotoProfil(publicUrl);
      Swal.fire({ icon: 'success', title: 'Foto Diperbarui!', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[30px]' } });
    } catch (err) {
      Swal.fire('Gagal', 'Gagal mengganti foto profil', 'error');
    } finally {
      setUploadingProfil(false);
    }
  };

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };

    async function fetchData() {
      setLoading(true);
      try {
        // Ambil Data Profil
        const { data: profData } = await supabase.from('profil_shifa').select('foto_url').eq('id', 1).single();
        if (profData?.foto_url) setFotoProfil(profData.foto_url);

        // Ambil Statistik
        const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const { count: obsCount } = await supabase.from('observations').select('*', { count: 'exact', head: true }).gte('created_at', lastWeek.toISOString());

        setTotalStudents(studentCount || 0);
        setWeeklyObservations(obsCount || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    updateDate();
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-32">
      {/* Header Area Personal */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-rose-500 pt-14 pb-24 px-8 rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-white text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
              <CalendarIcon size={12} />
              {currentDate || "Memuat..."}
            </div>

            <button onClick={handleLogout} className="p-2 bg-white/10 hover:bg-rose-500/20 backdrop-blur-md rounded-2xl border border-white/30 text-white transition-all active:scale-90">
              <LogOut size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Foto Profil Interaktif */}
            <label className="relative cursor-pointer group shrink-0">
              <div className="w-20 h-20 rounded-[30px] border-4 border-white/30 overflow-hidden shadow-2xl bg-white/20 flex items-center justify-center">
                {uploadingProfil ? (
                  <Loader2 className="animate-spin text-white" />
                ) : (
                  <img src={fotoProfil} alt="Profil" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-lg text-indigo-600 group-hover:scale-110 transition-transform">
                <Camera size={12} />
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleGantiFoto} />
            </label>

            <div className="space-y-1">
              <h1 className="text-white text-2xl font-black tracking-tight leading-none">
                Halo, Ibu Shifa! <span className="inline-block animate-bounce text-xl">🌸</span>
              </h1>
              <p className="text-indigo-50 text-[11px] font-bold opacity-90 uppercase tracking-widest">
                Shifa Zakiah Darajat
              </p>
              <div className="inline-flex items-center gap-1.5 bg-rose-500/30 px-2 py-0.5 rounded-md border border-rose-400/20">
                <Heart size={10} className="text-rose-200 fill-rose-200" />
                <span className="text-[9px] text-white font-black uppercase">Guru Berhati Mulia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-12 grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white flex flex-col gap-3 relative overflow-hidden active:scale-95 transition-transform">
          <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Murid</p>
            <h3 className="text-2xl font-black text-slate-800">
              {loading ? <Loader2 size={18} className="animate-spin text-slate-300" /> : totalStudents}
              <span className="text-xs font-medium text-slate-400 ml-1">Anak</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white flex flex-col gap-3 active:scale-95 transition-transform">
          <div className="bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center text-rose-500">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cinta Minggu Ini</p>
            <h3 className="text-2xl font-black text-slate-800">
              {loading ? <Loader2 size={18} className="animate-spin text-slate-300" /> : weeklyObservations}
              <span className="text-xs font-medium text-slate-400 ml-1">Catatan</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Menu Utama */}
      <div className="px-6 mt-8 grid grid-cols-2 gap-4">
        <Link href="/albums">
          <div className="bg-white p-4 h-full rounded-[35px] shadow-lg shadow-purple-100/50 border border-purple-50 flex flex-col justify-between group active:scale-95 transition-all">
            <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-purple-200">
              <ImageIcon size={22} />
            </div>
            <div className="mt-4">
              <h3 className="font-black text-slate-800 text-xs">Album Kenangan</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Momen Shifa</p>
            </div>
          </div>
        </Link>

        <Link href="/notess">
          <div className="bg-white p-4 h-full rounded-[35px] shadow-lg shadow-emerald-100/50 border border-emerald-50 flex flex-col justify-between group active:scale-95 transition-all">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <BookOpen size={22} />
            </div>
            <div className="mt-4">
              <h3 className="font-black text-slate-800 text-xs">Agenda & Catatan</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Jadwal Harian</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="px-8 mt-10 mb-6 flex items-center justify-between">
        <h2 className="text-slate-800 font-black text-xl tracking-tight">Aktivitas Mengajar</h2>
        <Sparkles size={18} className="text-amber-400 animate-pulse" />
      </div>

      <div className="px-6 space-y-4">
        <Link href="/observation">
          <button className="w-full bg-white p-2 rounded-[35px] shadow-lg shadow-indigo-100/50 flex items-center group active:scale-95 transition-all">
            <div className="bg-indigo-600 text-white p-5 rounded-[28px] shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
              <MessageSquareText size={24} />
            </div>
            <div className="flex-1 text-left ml-4">
              <span className="block font-black text-slate-800">Observasi Baru</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Catat Perkembangan Murid</span>
            </div>
            <div className="mr-4 text-slate-300">
              <ArrowRight size={20} />
            </div>
          </button>
        </Link>

        <Link href="/students">
          <button className="w-full bg-indigo-50/50 p-2 rounded-[35px] border border-indigo-100/50 flex items-center group active:scale-95 transition-all">
            <div className="bg-white text-indigo-600 p-5 rounded-[28px] shadow-sm">
              <Users size={24} />
            </div>
            <div className="flex-1 text-left ml-4">
              <span className="block font-black text-indigo-900">Data Murid</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Lihat & Perbarui Profil</span>
            </div>
            <div className="mr-4 text-indigo-200">
              <ArrowRight size={20} />
            </div>
          </button>
        </Link>
      </div>

      <div className="mt-12 text-center px-10 pb-10 opacity-60">
        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest leading-relaxed italic">
          "Setiap anak adalah bintang yang bersinar." <br/>
          — Shifa Zakiah Darajat
        </p>
      </div>
    </div>
  );
}