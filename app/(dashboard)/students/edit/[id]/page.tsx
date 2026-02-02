"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2, Calendar, User, Heart, Camera, X, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // State untuk gambar
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: 'Laki-laki',
    parent_name: '',
    avatar_url: '' 
  });

  // 1. Ambil Data Murid saat halaman dibuka
  useEffect(() => {
    async function getStudent() {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name || '',
            birth_date: data.birth_date || '',
            gender: data.gender || 'Laki-laki',
            parent_name: data.parent_name || '',
            avatar_url: data.avatar_url || ''
          });
          if (data.avatar_url) setImagePreview(data.avatar_url);
        }
      } catch (error: any) {
        Swal.fire('Error', 'Gagal memuat data murid', 'error');
        router.push('/students');
      } finally {
        setFetching(false);
      }
    }
    getStudent();
  }, [params.id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('File Terlalu Besar', 'Maksimal ukuran foto adalah 2MB', 'error');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let finalAvatarUrl = formData.avatar_url;

      // 2. Jika ada foto baru yang dipilih, upload dulu
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        finalAvatarUrl = publicUrl;
      }

      // 3. Update semua data ke database
      const { error } = await supabase
        .from('students')
        .update({
          name: formData.name,
          birth_date: formData.birth_date,
          gender: formData.gender,
          parent_name: formData.parent_name,
          avatar_url: finalAvatarUrl
        })
        .eq('id', params.id);

      if (error) throw error;

      // SUCCESS SWEETALERT
      Swal.fire({
        title: 'Pembaruan Berhasil!',
        text: `Data ${formData.name} telah diperbarui dengan aman ✨`,
        icon: 'success',
        confirmButtonColor: '#0F172A',
        confirmButtonText: 'Kembali ke Daftar',
        customClass: {
          popup: 'rounded-[35px]',
          confirmButton: 'rounded-2xl px-6 py-3 font-bold'
        }
      }).then(() => {
        router.push('/students');
      });

    } catch (error: any) {
      Swal.fire('Gagal!', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFD]">
      <Loader2 className="animate-spin text-slate-900" size={32} />
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Menyiapkan Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-10 text-slate-800">
      {/* Header Ramping */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-50">
        <Link href="/students" className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Edit Profil</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pembaruan Data Murid</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="px-6 mt-8 space-y-7">
        
        {/* EDIT FOTO MURID */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative group">
            <div className="w-32 h-32 bg-slate-50 rounded-[45px] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200/60 flex items-center justify-center relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <User size={40} className="text-slate-200" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-2.5 rounded-2xl border-2 border-white shadow-lg">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Ketuk untuk ganti foto</p>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User size={12} /> Nama Lengkap
            </label>
            <input 
              required type="text" value={formData.name}
              className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar size={12} /> Tanggal Lahir
            </label>
            <input 
              required type="date" value={formData.birth_date}
              className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Heart size={12} /> Wali Murid
            </label>
            <input 
              required type="text" value={formData.parent_name}
              className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
              onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
            <div className="grid grid-cols-2 gap-3">
              {['Laki-laki', 'Perempuan'].map((g) => (
                <button
                  key={g} type="button"
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    formData.gender === g 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'bg-white border-slate-50 text-slate-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} className="text-indigo-400" />}
            {loading ? 'Menyimpan Perubahan...' : 'Perbarui Profil'}
          </button>
        </div>
      </form>
    </div>
  );
}