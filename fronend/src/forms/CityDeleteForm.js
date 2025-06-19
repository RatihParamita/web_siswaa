import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes, FaBan, FaTrash } from 'react-icons/fa';

function CityDeleteForm({ city, onClose, onDelete }) {
    // State untuk mengontrol efek fade dan render
    const [showContent, setShowContent] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Mengelola status buka/tutup internal

    // Karena CityList yang akan mengontrol kapan form ditampilkan (city !== null),
    // kita perlu state internal untuk 'isOpen' untuk mengelola transisi.
    // Kita anggap 'city' prop yang ada (bukan null) berarti form harus 'open'.
    useEffect(() => {
        if (city) { // Jika ada kota yang akan dihapus, berarti form seharusnya terbuka
            setIsOpen(true);
            const timer = setTimeout(() => {
                setShowContent(true); // Mulai fade-in setelah sedikit delay
            }, 50);
            return () => clearTimeout(timer); // Cleanup timer
        } else {
            // Jika city null, berarti form harus ditutup, mulai fade-out
            setShowContent(false);
            const timer = setTimeout(() => {
                setIsOpen(false); // Setelah fade-out, baru sembunyikan sepenuhnya
            }, 300); // Sesuaikan dengan durasi transisi
            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [city]); // Bergantung pada prop 'city'

    // Komponen hanya akan unmount jika form benar-benar tertutup dan transisi fade-out selesai
    // Ini penting agar transisi fade-out bisa berjalan sebelum komponen dihapus dari DOM.
    if (!isOpen && !showContent) return null;

    const handleConfirmClick = () => {
        setShowContent(false); // Mulai fade-out
        setTimeout(() => {
            if (city) {
                onDelete(city.id); // Panggil fungsi hapus dari parent
            }
        }, 300); // Sesuaikan dengan durasi transisi
    };

    const handleCancelClick = () => {
        setShowContent(false); // Mulai fade-out
        setTimeout(() => {
            onClose(); // Panggil fungsi tutup dari parent
        }, 300); // Sesuaikan dengan durasi transisi
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${showContent ? 'opacity-100' : 'opacity-0'}`}">
            <div
                // Konten form diberi transisi untuk opacity dan transform (scale untuk efek zoom)
                className={`bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 ease-in-out ${
                    showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaExclamationTriangle className="mr-3 text-red-500" /> Konfirmasi Hapus
                    </h2>
                    <button onClick={handleCancelClick} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>
                <div className="text-center mb-6">
                    <p className="text-lg text-gray-700">
                        Anda yakin ingin menghapus kota "<strong>{city.name}</strong>"?
                    </p>
                    <p className="mb-4 text-red-600 text-sm font-semibold mt-2">
                        Tindakan ini mungkin mempengaruhi data mahasiswa yang terkait dengan kota ini!
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Tindakan ini tidak dapat dibatalkan!
                    </p>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button" // Penting untuk mencegah submit form jika ada form di sekitar
                        onClick={handleCancelClick}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    >
                        <FaTimes className="mr-2" /> Batal
                    </button>
                    <button
                        type="button" // Penting untuk mencegah submit form jika ada form di sekitar
                        onClick={handleConfirmClick}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    >
                        <FaTrash className="mr-2" /> Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CityDeleteForm;