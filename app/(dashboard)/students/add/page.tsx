"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2, Calendar, User, Heart, Camera, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: 'Laki-laki',
    parent_name: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (maks 2MB) agar aplikasi tetap ringan
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Terlalu Besar',
          text: 'Maksimal ukuran foto adalah 2MB ya, Bu.',
          customClass: { popup: 'rounded-[30px]' }
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let avatarUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        // Menggunakan Timestamp agar nama file selalu unik dan tidak tumpang tindih
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        avatarUrl = publicUrl;
      }

      const { error } = await supabase.from('students').insert([
        { 
          ...formData, 
          avatar_url: avatarUrl 
        }
      ]);

      if (error) throw error;

      // SUCCESS SWEETALERT
      Swal.fire({
        title: 'Berhasil!',
        text: `${formData.name} kini resmi terdaftar di Ruang Shifa 🌸`,
        icon: 'success',
        confirmButtonColor: '#4F46E5', // Indigo-600
        confirmButtonText: 'Lihat Daftar Murid',
        customClass: {
          popup: 'rounded-[35px]',
          confirmButton: 'rounded-2xl px-6 py-3 font-bold'
        }
      }).then(() => {
        router.push('/students');
      });

    } catch (error: any) {
      Swal.fire({
        title: 'Gagal Menyimpan',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#0F172A',
        customClass: { popup: 'rounded-[30px]' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-10">
      {/* Header Minimalis */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-50">
        <Link href="/students" className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Pendaftaran Murid</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tambah Data Murid</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 mt-8 space-y-7">
        
        {/* INPUT FOTO MURID DENGAN PREVIEW ELEGAN */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-slate-50 rounded-[45px] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200/60 flex items-center justify-center relative transition-transform active:scale-95">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Unggah Foto</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
            {imagePreview && (
              <button 
                type="button"
                onClick={() => { setImagePreview(null); setImageFile(null); }}
                className="absolute -top-1 -right-1 bg-rose-500 text-white p-2 rounded-2xl shadow-lg border-2 border-white active:scale-90 transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Form Fields dengan Desain "Asisten Pribadi" */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User size={12} /> Nama Lengkap Murid
            </label>
            <input 
              required
              type="text"
              placeholder="Contoh: Aisyah Putri"
              className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 shadow-inner"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar size={12} /> Tanggal Lahir
            </label>
            <input 
              required
              type="date"
              className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
               Jenis Kelamin
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Laki-laki', 'Perempuan'].map((g) => (
                <button
                  key={g}
                  type="button"
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Heart size={12} /> Wali Murid
            </label>
            <input 
              required
              type="text"
              placeholder="Nama Ayah atau Ibu"
              className="w-full bg-slate-50 border border-slate-100 rounded-[22px] py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300 shadow-inner"
              onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} className="text-indigo-400" />}
            {loading ? 'Memproses Data...' : 'Verifikasi & Simpan'}
          </button>
        </div>
      </form>

      <div className="mt-10 text-center opacity-30 px-10">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] leading-relaxed italic">
          "Pencatatan data murid yang akurat adalah awal dari pengajaran yang hebat."
        </p>
      </div>
    </div>
  );
}