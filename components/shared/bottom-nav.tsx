"use client"; // Wajib karena menggunakan usePathname

import { Home, Users, Mic, BarChart3, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  // Fungsi untuk mengecek apakah link sedang aktif
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 pb-safe shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-50">
      <div className="flex justify-around items-center h-20 px-4">
        
        {/* Beranda */}
        <Link href="/" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/') ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-wider">Beranda</span>
        </Link>

        {/* Murid */}
        <Link href="/students" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/students') ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Users size={22} strokeWidth={isActive('/students') ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-wider">Murid</span>
        </Link>

        {/* Tombol Tengah (Observasi/Mic) */}
        <Link href="/observation" className="relative -mt-10 group">
          <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-200 border-4 border-white active:scale-95 transition-all">
            <Mic size={24} />
          </div>
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap">Catat</span>
        </Link>

        {/* Rekap/Laporan */}
        <Link href="/assessment" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/assessment') ? 'text-indigo-600' : 'text-slate-400'}`}>
          <BarChart3 size={22} strokeWidth={isActive('/assessment') ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-wider">Laporan</span>
        </Link>

        {/* Absensi (MENGGANTIKAN AKUN) */}
        <Link href="/attedance" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/attedance') ? 'text-indigo-600' : 'text-slate-400'}`}>
          <ClipboardCheck size={24} strokeWidth={isActive('/attedance') ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-wider">Absensi</span>
        </Link>

      </div>
    </nav>
  );
}