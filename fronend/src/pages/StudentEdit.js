import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { FaSave, FaTimes } from 'react-icons/fa';

function StudentEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const authToken = localStorage.getItem('auth_token');

    const [formData, setFormData] = useState({
        nim: '', name: '', born_date: '', gender: '', city: '', address: ''
    });
    
    const [errors, setErrors] = useState({});
    const [cities, setCities] = useState([]); // 1. State baru untuk menampung daftar kota

    // 2. useEffect sekarang akan mengambil data mahasiswa DAN data kota
    useEffect(() => {
        if (!authToken) return;

        const fetchStudentAndCities = async () => {
            // Ambil data mahasiswa yang akan diedit
            try {
                const studentResponse = await axios.get(`http://localhost:8000/api/students/${id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setFormData(studentResponse.data);
            } catch (error) {
                console.error("Gagal mengambil data mahasiswa:", error);
            }

            // Ambil daftar semua kota untuk dropdown
            try {
                const citiesResponse = await axios.get('http://localhost:8000/api/cities', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setCities(citiesResponse.data);
            } catch (error) {
                console.error("Gagal mengambil data kota:", error);
            }
        };
        
        fetchStudentAndCities();
    }, [id, authToken]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            await axios.put(`http://localhost:8000/api/students/${id}`, formData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            navigate('/students');
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Gagal memperbarui data mahasiswa:", error);
            }
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col items-center">
                <div className="w-full max-w-4xl">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Mahasiswa</h1>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* ... input untuk NIM, Name, Born Date, Gender tidak berubah ... */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">NIM</label>
                                    <input type="text" name="nim" value={formData.nim} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    {errors.nim && <p className="text-red-500 text-xs mt-1">{errors.nim[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Nama</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Tanggal Lahir</label>
                                    <input type="date" name="born_date" value={formData.born_date} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    {errors.born_date && <p className="text-red-500 text-xs mt-1">{errors.born_date[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender[0]}</p>}
                                </div>

                                {/* --- 3. GANTI INPUT KOTA MENJADI DROPDOWN --- */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Kota</label>
                                    <select 
                                        name="city" 
                                        value={formData.city} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Pilih Kota --</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city[0]}</p>}
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Alamat</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="4" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address[0]}</p>}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                                <Link to="/students" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                    <FaTimes className="mr-2" /> Batal
                                </Link>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                    <FaSave className="mr-2" /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default StudentEdit;