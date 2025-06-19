import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
// 1. Tambahkan ikon-ikon baru yang akan kita gunakan
import { FaUserCircle, FaIdCard, FaBirthdayCake, FaTransgender, FaMapMarkerAlt, FaHome, FaArrowLeft, FaPencilAlt, FaTimes } from 'react-icons/fa';

// Komponen kecil untuk menampilkan setiap detail agar rapi
const DetailItem = ({ icon, label, value }) => (
    <div>
        <label className="text-sm font-semibold text-gray-500">{label}</label>
        <div className="flex items-center mt-1">
            <div className="text-blue-500 mr-3">{icon}</div>
            <p className="text-lg text-gray-800">{value}</p>
        </div>
    </div>
);

function StudentDetailForm({ isOpen, onClose, studentId }) {
    const [student, setStudent] = useState(null);
    const authToken = localStorage.getItem('auth_token');

    // State baru untuk mengontrol efek fade (opacity dan scale)
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            // Pastikan form terbuka dan studentId ada sebelum fetch
            if (!isOpen || !studentId || !authToken) {
                setStudent(null); // Reset student jika form ditutup atau ID tidak ada
                return;
            };

            try {
                const response = await axios.get(`http://localhost:8000/api/students/${studentId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setStudent(response.data);
            } catch (error) {
                console.error("Gagal mengambil data profil mahasiswa:", error);
                setStudent(null); // Atur student menjadi null jika gagal fetch
            }
        };
        if (isOpen) {
            fetchStudent();
            // Trigger fade-in setelah sedikit delay
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 50); // Delay kecil (misal 50ms)
            return () => clearTimeout(timer); // Cleanup timer
        } else {
            // Trigger fade-out saat form ditutup dari luar
            setShowContent(false);
        }
    }, [isOpen, studentId, authToken]); // Dependencies ditambahkan isOpen dan studentId

    // Hanya unmount jika form tidak terbuka DAN konten tidak lagi ditampilkan (setelah fade-out)
    if (!isOpen && !showContent) return null;

    // Tampilan Loading jika form terbuka dan data belum dimuat
    if (isOpen && !student && showContent) {
        return (
            // Overlay dan konten loading juga diberi transisi
            <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <div className={`bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl text-center transform transition-all duration-300 ease-in-out ${
                    showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}>
                    <p className="text-lg font-semibold text-gray-700 mb-4">Loading...</p>
                    {/* Tombol Tutup: Picu fade-out, lalu panggil onClose setelah delay */}
                    <button onClick={() => { setShowContent(false); setTimeout(onClose, 300); }} className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                        Tutup
                    </button>
                </div>
            </div>
        );
    }

    // Jika student null setelah loading selesai (misal gagal fetch), jangan render apa-apa
    if (!student) return null;

    return (
        // Overlay untuk pop-up diberi transisi opasitas
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                // Konten form diberi transisi untuk opacity dan transform (scale untuk efek zoom)
                className={`bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
                    showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Profil Mahasiswa</h2>
                    {/* Tombol close: Picu fade-out, lalu panggil onClose setelah delay */}
                    <button onClick={() => { setShowContent(false); setTimeout(onClose, 300); }} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Kartu Profil Mahasiswa */}
                <div className="bg-white rounded-2xl">
                    {/* Bagian Header Kartu (Nama & Foto) */}
                    <div className="flex items-center pb-6 border-b border-gray-200">
                        <FaUserCircle size={80} className="text-gray-300" />
                        <div className="ml-6">
                            <h2 className="text-3xl font-bold text-gray-900">{student.name}</h2>
                            <p className="text-md text-gray-500">ID Mahasiswa: {student.id}</p>
                        </div>
                    </div>

                    {/* Bagian Detail dengan Layout Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <DetailItem icon={<FaIdCard />} label="NIM" value={student.nim} />
                        <DetailItem icon={<FaBirthdayCake />} label="Tanggal Lahir" value={student.born_date} />
                        <DetailItem icon={<FaTransgender />} label="Gender" value={student.gender} />
                        <DetailItem icon={<FaMapMarkerAlt />} label="Kota" value={student.city} />
                        {/* Alamat dibuat memanjang 2 kolom */}
                        <div className="md:col-span-2">
                            <DetailItem icon={<FaHome />} label="Alamat" value={student.address} />
                        </div>
                    </div>

                    {/* Tombol Aksi di Bagian Bawah */}
                    <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200 space-x-4">
                        {/* Tombol Kembali: Picu fade-out, lalu panggil onClose setelah delay */}
                        <button onClick={() => { setShowContent(false); setTimeout(onClose, 300); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center">
                            <FaArrowLeft className="mr-2" /> Kembali
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDetailForm;