"use client";

import React, { useState } from 'react';
import { ChevronDown, UserCircle2, Search } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  avatar_url?: string; // Diubah dari imageUrl ke avatar_url agar sesuai DB
}

interface StudentPickerProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  selectedStudentId: string | null;
}

export default function StudentPicker({ students, onSelectStudent, selectedStudentId }: StudentPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Fitur tambahan: Pencarian murid agar lebih mudah jika muridnya banyak
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      {/* Tombol Dropdown Utama */}
      <button
        type="button"
        className={`w-full bg-white p-4 rounded-[24px] border transition-all flex items-center justify-between active:scale-[0.98] shadow-sm ${
          isOpen ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {selectedStudent?.avatar_url ? (
            <img 
              src={selectedStudent.avatar_url} 
              alt={selectedStudent.name} 
              className="w-10 h-10 rounded-2xl object-cover border border-slate-100" 
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
              <UserCircle2 size={24} />
            </div>
          )}
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Murid Terpilih</p>
            <p className="font-bold text-slate-700 leading-none">
              {selectedStudent ? selectedStudent.name : "Pilih Nama Murid"}
            </p>
          </div>
        </div>
        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Panel Pilihan Murid */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          
          {/* Input Cari Murid */}
          <div className="p-4 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Cari nama murid..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Daftar Murid */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    onSelectStudent(student.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left flex items-center gap-4 p-4 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-none ${
                    selectedStudentId === student.id ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  {student.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt={student.name} 
                      className="w-11 h-11 rounded-2xl object-cover border border-white shadow-sm" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <UserCircle2 size={24} />
                    </div>
                  )}
                  <div>
                    <span className={`block font-bold text-sm ${selectedStudentId === student.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {student.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Lihat Profil</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Murid tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}