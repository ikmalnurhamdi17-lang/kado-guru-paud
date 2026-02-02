"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Tambahkan AnimatePresence
import { supabase } from '@/lib/supabase';
import { 
  Mail, Lock, Loader2, Eye, EyeOff, 
  Home, Heart, AlertCircle // Tambahkan AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State untuk pesan error
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); 

    try {
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), // Tambahkan trim agar tidak ada spasi yang tak sengaja terikut
        password: password 
      });
      
      if (error) {
        // Cukup set error message, tidak perlu 'throw error'
        setErrorMessage('Email atau Password salah, Bu Shifa. Silakan cek kembali.');
        
        Swal.fire({
          title: 'Akses Ditolak',
          text: 'Email atau Password sepertinya salah, Bu Shifa.',
          icon: 'error',
          confirmButtonColor: '#0F172A',
          customClass: { popup: 'rounded-[30px]' }
        });
        return; // Hentikan di sini jika gagal
      }

      if (data.user) {
        router.push('/');
      }
    } catch (error: any) {
      console.log("Terjadi kendala teknis:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] flex flex-col justify-center items-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-[340px]"
      >
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[30px] shadow-xl shadow-indigo-100 mb-5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 to-indigo-500 opacity-50"></div>
              <div className="relative flex items-center justify-center">
                <Home size={34} className="text-white fill-white/20" />
                <Heart size={14} className="text-rose-300 fill-rose-300 absolute -top-3 -right-2 animate-pulse" />
                <Heart size={10} className="text-rose-200 fill-rose-200 absolute top-4 -right-4 opacity-80" />
                <Heart size={12} className="text-rose-100 fill-rose-100 absolute -bottom-2 -left-3 opacity-60" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Ruang Shifa</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Asisten Digital Guru PAUD</p>
          </div>
        </div>

        {/* Card Login */}
        <div className="bg-white p-7 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50">
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={12} className="text-indigo-500" /> Email
              </label>
              <input 
                type="email" 
                required
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(''); // Hilangkan error saat Ibu mengetik ulang
                }}
                className="w-full bg-slate-50 border border-slate-100 py-3.5 px-4 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                placeholder="nama@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} className="text-rose-400" /> Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password} 
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(''); // Hilangkan error saat Ibu mengetik ulang
                  }}
                  className="w-full bg-slate-50 border border-slate-100 py-3.5 px-4 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Pesan Informasi Error */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-rose-50 text-rose-600 p-3 rounded-xl border border-rose-100"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <p className="text-[10px] font-bold leading-tight">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95 transition-all disabled:bg-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Masuk ke Sistem"}
            </button>
          </form>

          {/* ... bagian Google Login tetap sama ... */}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">Edisi PWA v1.0 • Ruang Shifa</p>
        </div>
      </motion.div>
    </div>
  );
}