"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, Calendar, ChevronDown, Activity, 
  CheckCircle2, XCircle, Clock, Trash2 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export default function AttendanceHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fungsi Ambil Data
  const fetchAttendanceHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        date, 
        status,
        students (name)
      `);

    if (data) {
      const grouped = data.reduce((acc: any, curr: any) => {
        const date = curr.date;
        if (!acc[date]) {
          acc[date] = { 
            date, 
            hadir: [], sakit: [], izin: [], alpha: [],
            counts: { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 } 
          };
        }
        const studentName = curr.students?.name || "Tanpa Nama";
        const status = curr.status;
        
        acc[date].counts[status]++;
        if (status === 'Hadir') acc[date].hadir.push(studentName);
        else if (status === 'Sakit') acc[date].sakit.push(studentName);
        else if (status === 'Izin') acc[date].izin.push(studentName);
        else if (status === 'Alpha') acc[date].alpha.push(studentName);
        
        return acc;
      }, {});

      const sortedHistory = Object.values(grouped).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setHistory(sortedHistory);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  // 2. FUNGSI HAPUS SEMUA (RESET) DENGAN SWEETALERT2
  const handleResetHistory = async () => {
    if (history.length === 0) return;

    Swal.fire({
      title: 'Mulai Tahun Ajaran Baru?',
      text: "Seluruh riwayat absensi akan dihapus permanen dari sistem Ruang Shifa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F172A', // Slate-900
      cancelButtonColor: '#94A3B8', // Slate-400
      confirmButtonText: 'Ya, Bersihkan Semua',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-[35px]',
        confirmButton: 'rounded-2xl px-6 py-3 font-bold',
        cancelButton: 'rounded-2xl px-6 py-3 font-bold'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDeleting(true);
        try {
          const { error } = await supabase
            .from('attendance')
            .delete()
            .neq('status', 'kosong');

          if (error) throw error;

          Swal.fire({
            title: 'Berhasil!',
            text: 'Riwayat telah dibersihkan. Selamat mengajar di periode baru! ✨',
            icon: 'success',
            confirmButtonColor: '#0F172A',
            customClass: { popup: 'rounded-[30px]' }
          });
          
          setHistory([]);
        } catch (error: any) {
          Swal.fire('Gagal!', error.message, 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const toggleDetail = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFD]">
      <Loader2 className="animate-spin text-slate-900 mb-4" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-32">
      {/* Header Minimalis dengan Tombol Reset di Pojok Kanan */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-14 pb-6 sticky top-0 z-[100] border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Riwayat Absensi</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Asisten Digital Shifa</p>
            </div>
          </div>

          {/* Tombol Hapus Semua di Pojok Kanan Atas */}
          {history.length > 0 && (
            <button 
              onClick={handleResetHistory}
              disabled={isDeleting}
              className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-90"
              title="Reset Tahun Ajaran"
            >
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {history.length > 0 ? (
          history.map((item: any) => (
            <div key={item.date} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all">
              {/* Card Header */}
              <button 
                onClick={() => toggleDetail(item.date)}
                className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg shadow-slate-200">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-black text-[13px] text-slate-800 tracking-tight">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={10} /> {item.counts.Hadir}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                        <Clock size={10} /> {item.counts.Sakit + item.counts.Izin}
                      </span>
                      <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                        <XCircle size={10} /> {item.counts.Alpha}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`p-2 bg-slate-50 rounded-full text-slate-400 transition-transform duration-300 ${expandedDate === item.date ? 'rotate-180' : ''}`}>
                  <ChevronDown size={18} />
                </div>
              </button>

              {/* Detail Area */}
              <AnimatePresence>
                {expandedDate === item.date && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 bg-slate-50/30 border-t border-slate-50"
                  >
                    <div className="pt-4 space-y-4">
                      {[
                        { label: 'Sakit / Izin', data: [...item.sakit, ...item.izin], color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Alpha / Tanpa Ket', data: item.alpha, color: 'text-rose-600', bg: 'bg-rose-50' },
                      ].map((sec, i) => sec.data.length > 0 && (
                        <div key={i} className="space-y-2">
                          <p className={`text-[9px] font-black uppercase tracking-widest ${sec.color}`}>{sec.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {sec.data.map((name: string, idx: number) => (
                              <span key={idx} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold ${sec.bg} ${sec.color} border border-white shadow-sm`}>
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {item.hadir.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Hadir ({item.hadir.length})</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                            {item.hadir.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
            <Activity className="mx-auto text-slate-200 mb-4" size={40} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed italic">Belum ada riwayat tersedia</p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 pb-10 text-center opacity-40">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Sistem Log Aktif</p>
      </div>
    </div>
  );
}