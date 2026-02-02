"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mic, Send, Flag, Sparkles, Loader2, Heart, Brain, 
  Music, Languages, MicOff, CheckCircle2, User 
} from 'lucide-react';
import StudentPicker from '@/components/shared/student-picker';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2'; // Pastikan sudah install SweetAlert2

interface Student {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Aspect {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const developmentAspects: Aspect[] = [
  { id: 'Agama & Moral', name: "Agama & Moral", icon: Sparkles, color: 'bg-purple-500' },
  { id: 'Fisik Motorik', name: "Fisik Motorik", icon: Flag, color: 'bg-amber-500' },
  { id: 'Kognitif', name: "Kognitif", icon: Brain, color: 'bg-blue-500' },
  { id: 'Bahasa', name: "Bahasa", icon: Languages, color: 'bg-emerald-500' },
  { id: 'Sosial Emosional', name: "Sosial Emosional", icon: Heart, color: 'bg-rose-500' },
  { id: 'Seni', name: "Seni", icon: Music, color: 'bg-indigo-500' },
];

export default function ObservationPage() {
  const [isClient, setIsClient] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    fetchStudents();
    
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      if (SpeechRecognition) {
        const newRecognition = new SpeechRecognition();
        newRecognition.continuous = true;
        newRecognition.interimResults = true;
        newRecognition.lang = 'id-ID';

        newRecognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setNote(prev => prev + (prev ? ' ' : '') + finalTranscript);
          }
        };

        newRecognition.onend = () => setIsRecording(false);
        setRecognition(newRecognition);
      }
    }
  }, []);

  async function fetchStudents() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, avatar_url')
        .order('name', { ascending: true });
      
      if (error) throw error;
      if (data) setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const toggleRecording = () => {
    if (!recognition) {
      Swal.fire({
        title: 'Mic Tidak Terdeteksi',
        text: 'Browser Ibu sepertinya tidak mendukung fitur suara.',
        icon: 'error',
        confirmButtonColor: '#0F172A',
        customClass: { popup: 'rounded-[30px]' }
      });
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      setIsRecording(true);
      recognition.start();
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudentId || !selectedAspect || !note.trim()) {
      Swal.fire({
        title: 'Data Belum Lengkap',
        text: 'Mohon pilih murid, aspek, dan isi catatannya ya, Bu.',
        icon: 'warning',
        confirmButtonColor: '#0F172A',
        customClass: { popup: 'rounded-[30px]' }
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('observations')
        .insert([{ 
          student_id: selectedStudentId, 
          aspect: selectedAspect, 
          note: note.trim() 
        }]);

      if (error) throw error;

      // SUCCESS SWEETALERT
      Swal.fire({
        title: 'Berhasil Disimpan!',
        text: 'Catatan perkembangan murid telah masuk ke database ✨',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[35px]' }
      });

      setNote('');
      setSelectedStudentId(null);
      setSelectedAspect(null);
    } catch (error: any) {
      Swal.fire('Gagal!', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-32">
      {/* Header Minimalis */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-14 pb-6 border-b border-slate-50 sticky top-0 z-20">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Observasi Murid</h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Asisten Pribadi Shifa</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Pilih Murid */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <User size={12} className="text-indigo-500" /> Subjek Observasi
          </label>
          {loading ? (
            <div className="h-16 animate-pulse bg-slate-50 rounded-[28px] w-full border border-slate-100" />
          ) : (
            <StudentPicker
              students={students}
              onSelectStudent={setSelectedStudentId}
              selectedStudentId={selectedStudentId}
            />
          )}
        </section>

        {/* Aspek Perkembangan */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Sparkles size={12} className="text-amber-400" /> Aspek Perkembangan
          </label>
          <div className="grid grid-cols-2 gap-3">
            {developmentAspects.map(aspect => {
              const Icon = aspect.icon;
              const isSelected = selectedAspect === aspect.id;
              return (
                <button
                  key={aspect.id}
                  onClick={() => setSelectedAspect(aspect.id)}
                  className={`flex items-center gap-3 p-3 rounded-[22px] border transition-all active:scale-95 ${
                    isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-100 text-slate-600'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : aspect.color + ' text-white'}`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-[10px] font-black leading-tight text-left">{aspect.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Input Area + Mic */}
        <section className="space-y-3 relative">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Brain size={12} className="text-rose-400" /> Catatan Kejadian
          </label>
          <div className="relative group">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ceritakan momen penting murid hari ini..."
              rows={6}
              className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[35px] outline-none text-sm font-medium text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all pb-20"
            />
            
            {/* Mic Button - Elegan & Minimalis */}
            <div className="absolute bottom-5 right-5 flex items-center gap-3">
              <AnimatePresence>
                {isRecording && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100"
                  >
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                      Mendengarkan...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 border-4 border-white ${
                  isRecording 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                }`}
              >
                {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isSaving || !note.trim()}
          className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} className="text-indigo-400" />}
          {isSaving ? 'Memproses Catatan...' : 'Simpan Observasi'}
        </button>
      </div>

      <div className="mt-12 text-center opacity-30 px-10">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] leading-relaxed italic">
          "Pencatatan perkembangan adalah bukti nyata rasa kasih sayang Ibu kepada murid."
        </p>
      </div>
    </div>
  );
}