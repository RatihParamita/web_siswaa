// fronend > src > components > StatCard.js
import React from 'react';
import { FaUsers, FaMale, FaFemale } from 'react-icons/fa'; // Import ikon yang akan digunakan

function StatCard({ value, label, bgColor, icon: IconComponent }) {
  return (
    <div className={`relative p-6 rounded-xl shadow-md overflow-hidden text-white transition-transform duration-300 hover:scale-105 ${bgColor}`}>
      {/* Ikon latar belakang besar yang semi-transparan */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center p-4">
        {/* Pastikan IconComponent ada sebelum dirender */}
        {IconComponent && <IconComponent className="text-white opacity-20" size={100} />}
      </div>

      {/* Konten utama kartu */}
      <div className="relative z-10 flex flex-col items-start">
        {/* Nilai / Angka Besar */}
        <div className="text-5xl font-bold mb-2">
          {value}
        </div>
        {/* Label / Deskripsi */}
        <div className="text-lg font-semibold leading-tight">
          {label}
        </div>
      </div>
    </div>
  );
}

export default StatCard;