import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
// 1. Tambahkan ikon-ikon baru yang akan kita gunakan
import { FaUserCircle, FaIdCard, FaBirthdayCake, FaTransgender, FaMapMarkerAlt, FaHome, FaArrowLeft, FaPencilAlt } from 'react-icons/fa';

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

function StudentDetail() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const authToken = localStorage.getItem('auth_token');

    useEffect(() => {
        const fetchStudent = async () => {
            if (!authToken) return;
            try {
                const response = await axios.get(`http://localhost:8000/api/students/${id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setStudent(response.data);
            } catch (error) {
                console.error("Gagal mengambil data detail mahasiswa:", error);
            }
        };
        fetchStudent();
    }, [id, authToken]);

    // Tampilan saat data sedang dimuat
    if (!student) {
        return <MainLayout><p className="text-center">Loading...</p></MainLayout>;
    }

    return (
        <MainLayout>
            {/* 2. Kita buat wrapper untuk memposisikan kartu di tengah */}
            <div className="flex flex-col items-center justify-center">

                {/* Header Halaman */}
                <div className="w-full max-w-4xl mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Profil Mahasiswa</h1>
                </div>

                {/* Kartu Profil Mahasiswa */}
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl">
                    
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
                        <Link to="/students" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center">
                            <FaArrowLeft className="mr-2" /> Kembali
                        </Link>
                        <Link to={`/students/edit/${student.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            <FaPencilAlt className="mr-2" /> Edit
                        </Link>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}

export default StudentDetail;