"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, Sparkles, Camera, Loader2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion'; // Tambahan untuk fitur swipe

export default function AlbumGallery() {
  const [photos, setPhotos] = useState<{ id: string; url: string; created_at: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Perubahan: Menggunakan index untuk mendukung fitur geser
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('album_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error("Error fetching photos:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `shifa-${Math.random()}.${fileExt}`;
      const filePath = `albums/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('albums')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('albums').getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('album_photos')
        .insert([{ url: publicUrl }]);

      if (dbError) throw dbError;

      fetchPhotos();
    } catch (error: any) {
      alert("Gagal mengunggah: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    if (!confirm("Ibu Shifa yakin ingin menghapus kenangan ini?")) return;

    try {
      setDeletingId(id);
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('albums').remove([`albums/${fileName}`]);
      }

      const { error } = await supabase
        .from('album_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPhotos(photos.filter(p => p.id !== id));
      setSelectedIndex(null);
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Fungsi navigasi untuk swipe
  const nextPhoto = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] pb-10">
      {/* Header Elegan */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-[50] border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-50 rounded-xl text-slate-400 active:scale-90 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight">Galeri Momen</h1>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Dokumentasi Senyum Sikecil</p>
          </div>
        </div>
        <Sparkles size={18} className="text-amber-400 animate-pulse" />
      </div>

      {/* Grid Utama - 4 Kolom */}
      <div className="p-3">
        {loading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-slate-300">
            <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center px-4">
              Menyusun kenangan Ibu Shifa...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            
            {/* TOMBOL TAMBAH FOTO (Pojok Kiri Atas) */}
            <label className="aspect-square bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all group overflow-hidden">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-indigo-500" />
              ) : (
                <>
                  <Camera size={20} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[7px] font-black text-indigo-400 uppercase mt-1 tracking-tighter text-center">Tambah</span>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleUpload} 
                disabled={uploading} 
              />
            </label>

            {/* DAFTAR FOTO */}
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                onClick={() => setSelectedIndex(index)}
                className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative group active:scale-95 transition-all cursor-zoom-in shadow-sm border border-slate-50"
              >
                <img 
                  src={photo.url} 
                  alt="Momen" 
                  className="w-full h-full object-cover" 
                />
                
                <button 
                  onClick={(e) => handleDelete(e, photo.id, photo.url)}
                  disabled={deletingId === photo.id}
                  className="absolute bottom-1 right-1 bg-white/90 p-1 rounded-md text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deletingId === photo.id ? <Loader2 size={8} className="animate-spin" /> : <Trash2 size={10} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULLSCREEN PREVIEW DENGAN SWIPE & TOMBOL KEMBALI */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center touch-none"
          >
            {/* Tombol Kembali di Pojok Kiri Atas */}
            <button 
              onClick={() => setSelectedIndex(null)}
              className="absolute top-12 left-6 z-[110] p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/10 flex items-center gap-2 active:scale-90 transition-all shadow-xl"
            >
              <ArrowLeft size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-shadow">Kembali</span>
            </button>

            {/* Area Foto yang bisa di-Swipe */}
            <motion.div
              key={selectedIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x < -50) nextPhoto();
                if (info.offset.x > 50) prevPhoto();
              }}
              className="w-full h-full flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
            >
              <img 
                src={photos[selectedIndex].url} 
                alt="Momen Fullscreen" 
                className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl pointer-events-none"
              />
            </motion.div>

            {/* Indikator Urutan Foto */}
            <div className="absolute bottom-10 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <p className="text-white text-[10px] font-black tracking-widest">
                    {selectedIndex + 1} / {photos.length}
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}