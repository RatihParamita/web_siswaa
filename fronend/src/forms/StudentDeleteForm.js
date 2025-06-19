import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'; // Menambahkan ikon untuk konfirmasi

// Props:
// isOpen: Boolean, untuk mengontrol apakah form terlihat.
// onClose: Fungsi, dipanggil saat form ditutup (cancel).
// onConfirm: Fungsi, dipanggil saat pengguna mengkonfirmasi penghapusan. Akan menerima studentId sebagai argumen.
// studentId: ID mahasiswa yang akan dihapus.
// studentName: Nama mahasiswa (opsional, untuk tampilan yang lebih personal).
function StudentDeleteForm({ isOpen, onClose, onConfirm, studentId, studentName }) {
    // State untuk mengontrol efek fade
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Trigger fade-in setelah sedikit delay agar transisi CSS berlaku
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 50); // Delay kecil (misal 50ms)
            return () => clearTimeout(timer); // Cleanup timer
        } else {
            // Trigger fade-out saat form ditutup
            setShowContent(false);
        }
    }, [isOpen]);

    // Komponen hanya akan unmount jika form benar-benar tertutup dan transisi fade-out selesai
    if (!isOpen && !showContent) return null;

    const handleConfirmClick = () => {
        setShowContent(false); // Mulai fade-out
        setTimeout(() => {
            onConfirm(studentId); // Panggil fungsi konfirmasi dari parent
        }, 300); // Sesuaikan dengan durasi transisi
    };

    const handleCancelClick = () => {
        setShowContent(false); // Mulai fade-out
        setTimeout(() => {
            onClose(); // Panggil fungsi close dari parent
        }, 300); // Sesuaikan dengan durasi transisi
    };

    return (
        // Overlay (latar belakang gelap) juga diberi transisi opasitas
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                // Konten form diberi transisi untuk opacity dan transform (scale untuk efek zoom)
                className={`bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 ease-in-out ${
                    showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaExclamationTriangle className="text-red-500 mr-3" /> Konfirmasi Hapus
                    </h2>
                    {/* Tombol close: Picu fade-out, lalu panggil onClose setelah delay */}
                    <button onClick={handleCancelClick} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <p className="text-lg text-gray-700">
                        Apakah Anda yakin ingin menghapus data mahasiswa ini:
                    </p>
                    <p className="text-xl font-semibold text-red-600 mt-2">
                        {studentName || "Mahasiswa ini"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Tindakan ini tidak dapat dibatalkan!</p>
                </div>

                <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    >
                        <FaTimes className="mr-2" /> Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmClick}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    >
                        <FaCheckCircle className="mr-2" /> Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudentDeleteForm;