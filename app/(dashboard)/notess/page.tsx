"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { 
  ArrowLeft, Plus, Heart, CheckCircle2, 
  Trash2, Send, Archive, Moon, 
  Pencil, X, Save, Check, Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2'; // Pastikan sudah install: npm install sweetalert2

export default function RuangShifaApp() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'cerita'>('agenda');
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  const [agendas, setAgendas] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newAgenda, setNewAgenda] = useState("");
  
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [myStory, setMyStory] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");

  // Konfigurasi SweetAlert yang serasi dengan desain Ruang Shifa
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    customClass: { popup: 'rounded-2xl' }
  });

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }));
    setNewDate(now.toISOString().split('T')[0]);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: agendaData, error: err1 } = await supabase.from('agenda_shifa').select('*').order('date', { ascending: true });
      const { data: ceritaData, error: err2 } = await supabase.from('cerita_shifa').select('*').order('created_at', { ascending: false });
      
      if (err1 || err2) throw new Error("Gagal mengambil data");
      
      setAgendas(agendaData || []);
      setNotes(ceritaData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgenda = async () => {
    if (!newAgenda || !newDate) return;
    try {
      if (editingId) {
        await supabase.from('agenda_shifa').update({ date: newDate, time: newTime, activity: newAgenda }).eq('id', editingId);
        setEditingId(null);
        Toast.fire({ icon: 'success', title: 'Jadwal diperbarui!' });
      } else {
        await supabase.from('agenda_shifa').insert([{ date: newDate, time: newTime, activity: newAgenda, is_done: false }]);
        Toast.fire({ icon: 'success', title: 'Jadwal ditambahkan!' });
      }
      setNewAgenda(""); setNewTime(""); fetchData();
    } catch (e) { 
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Ada masalah saat menyimpan jadwal.' });
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Jadwal?',
      text: "Data yang dihapus tidak bisa dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F172A',
      cancelButtonColor: '#F87171',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-[30px]' }
    });

    if (result.isConfirmed) {
      try {
        await supabase.from('agenda_shifa').delete().eq('id', id);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
        fetchData();
      } catch (e) {
        Swal.fire('Gagal!', 'Gagal menghapus data.', 'error');
      }
    }
  };

  const handleSaveStory = async () => {
    if (!myStory) return;
    try {
      if (editingStoryId) {
        await supabase.from('cerita_shifa').update({ mood: selectedMood, content: myStory }).eq('id', editingStoryId);
        setEditingStoryId(null);
        Toast.fire({ icon: 'success', title: 'Cerita diperbarui!' });
      } else {
        await supabase.from('cerita_shifa').insert([{ 
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), 
          mood: selectedMood, content: myStory 
        }]);
        Toast.fire({ icon: 'success', title: 'Cerita disimpan!' });
      }
      setMyStory(""); fetchData();
    } catch (e) { 
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Cerita gagal disimpan.' });
    }
  };

  const handleDeleteStory = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Kenangan?',
      text: "Cerita ini akan hilang selamanya.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48',
      cancelButtonColor: '#CBD5E1',
      confirmButtonText: 'Hapus Cerita',
      cancelButtonText: 'Jangan',
      customClass: { popup: 'rounded-[30px]' }
    });

    if (result.isConfirmed) {
      try {
        await supabase.from('cerita_shifa').delete().eq('id', id);
        Toast.fire({ icon: 'success', title: 'Cerita dihapus' });
        fetchData();
      } catch (e) {
        Swal.fire('Gagal!', 'Gagal menghapus cerita.', 'error');
      }
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "??/??";
    const parts = dateStr.split('-');
    return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : dateStr;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md px-6 pt-10 pb-4 sticky top-0 z-50 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-50 rounded-xl text-slate-400 active:scale-90 transition-all">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-black text-slate-800 leading-none">Ruang Shifa</h1>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{currentDate}</span>
          </div>
        </div>
        {loading && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      {/* Tab Switcher */}
      <div className="px-6 mt-6">
        <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1 w-full max-w-[220px] mb-8 shadow-inner">
          <button onClick={() => setActiveTab('agenda')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'agenda' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
            Agenda
          </button>
          <button onClick={() => setActiveTab('cerita')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'cerita' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>
            Cerita
          </button>
        </div>

        {activeTab === 'agenda' ? (
          <div className="space-y-6">
            <div className={`p-5 rounded-[30px] border shadow-sm transition-all ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
               <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">{editingId ? '⚡ Edit Jadwal' : '📝 Rencana Baru'}</p>
               <div className="space-y-3 text-slate-900">
                 <div className="flex gap-2">
                   <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1 bg-slate-50 p-3 rounded-xl text-[11px] font-bold outline-none" />
                   <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-24 bg-slate-50 p-3 rounded-xl text-[11px] font-bold outline-none" />
                 </div>
                 <div className="flex gap-2">
                   <input type="text" placeholder="Kegiatan..." value={newAgenda} onChange={(e) => setNewAgenda(e.target.value)} className="flex-1 bg-slate-50 p-3 rounded-xl text-[11px] font-bold outline-none placeholder:text-slate-300" />
                   <button onClick={handleSaveAgenda} className={`px-5 rounded-xl text-white shadow-lg ${editingId ? 'bg-amber-500' : 'bg-slate-900'}`}>
                     {editingId ? <Save size={18} /> : <Plus size={18} />}
                   </button>
                 </div>
                 {editingId && <button onClick={() => {setEditingId(null); setNewAgenda("");}} className="w-full py-2 text-[10px] font-black text-rose-500 bg-rose-50 rounded-lg">BATAL EDIT</button>}
               </div>
            </div>

            <div className="space-y-3">
              {agendas.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3 text-slate-900">
                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase flex items-center gap-1 ${item.is_done ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {item.is_done ? <Check size={10}/> : <Clock size={10}/>} {item.is_done ? 'Terlaksana' : 'Terjadwal'}
                    </div>
                    <div className="flex gap-4 text-slate-400">
                       <button onClick={() => {setEditingId(item.id); setNewDate(item.date); setNewTime(item.time); setNewAgenda(item.activity); window.scrollTo(0,0);}}><Pencil size={15} /></button>
                       <button onClick={() => handleDeleteAgenda(item.id)}><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-900">
                    <div className="text-center min-w-[45px] border-r border-slate-50 pr-3">
                      <p className="text-[9px] font-black text-indigo-500">{formatDisplayDate(item.date)}</p>
                      <p className="text-[10px] font-black">{item.time || "--:--"}</p>
                    </div>
                    <p className={`flex-1 text-[12px] font-bold ${item.is_done ? 'text-slate-300 line-through' : ''}`}>{item.activity}</p>
                    <button onClick={() => { supabase.from('agenda_shifa').update({ is_done: !item.is_done }).eq('id', item.id).then(() => fetchData()) }} className={item.is_done ? 'text-emerald-500' : 'text-slate-100'}>
                      <CheckCircle2 size={26} fill={item.is_done ? "currentColor" : "none"} className={item.is_done ? "text-white" : ""} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-5 rounded-[30px] border shadow-sm transition-all ${editingStoryId ? 'bg-amber-50 border-amber-200' : 'bg-rose-50/50 border-rose-100/50'}`}>
              <div className="flex justify-between items-center mb-4 text-slate-900">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{editingStoryId ? '⚡ Edit Kenangan' : '🌸 Mood Hari Ini'}</p>
                <div className="flex gap-2 bg-white/80 p-1 rounded-full">
                  {['😊', '😭', '😴', '😇'].map(emoji => (
                    <button key={emoji} onClick={() => setSelectedMood(emoji)} className={`text-xl transition-all ${selectedMood === emoji ? 'scale-110' : 'grayscale opacity-30'}`}>{emoji}</button>
                  ))}
                </div>
              </div>
              <textarea placeholder="Ceritakan harimu..." value={myStory} onChange={(e) => setMyStory(e.target.value)} className="w-full h-28 bg-white p-4 rounded-2xl text-[13px] text-slate-900 font-bold outline-none shadow-sm resize-none border-none placeholder:text-slate-300" />
              <button onClick={handleSaveStory} className={`w-full mt-3 py-3.5 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg ${editingStoryId ? 'bg-amber-500' : 'bg-rose-500'}`}>
                {editingStoryId ? 'Perbarui Cerita' : 'Simpan Cerita'}
              </button>
              {editingStoryId && <button onClick={() => {setEditingStoryId(null); setMyStory("");}} className="w-full mt-2 py-2 text-[10px] font-black text-slate-400">BATAL</button>}
            </div>

            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3 text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{note.mood}</span>
                      <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{note.date}</span>
                    </div>
                    <div className="flex gap-4 text-slate-400">
                       <button onClick={() => {setEditingStoryId(note.id); setMyStory(note.content); setSelectedMood(note.mood); window.scrollTo(0,0);}}><Pencil size={15} /></button>
                       <button onClick={() => handleDeleteStory(note.id)}><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-900 font-bold leading-relaxed italic border-l-4 border-rose-100 pl-4 py-1">"{note.content}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}