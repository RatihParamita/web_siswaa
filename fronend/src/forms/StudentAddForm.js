import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

// Komponen ini akan menerima props untuk mengontrol visibilitas dan callback
function StudentAddForm({ isOpen, onClose, onStudentAdded }) {
    const [formData, setFormData] = useState({
        nim: '', name: '', born_date: '', gender: 'Laki-laki', city: '', address: ''
    });

    const [errors, setErrors] = useState({});
    const [cities, setCities] = useState([]);
    const authToken = localStorage.getItem('auth_token');

    // State baru untuk mengontrol efek fade (opacity dan scale)
    const [showContent, setShowContent] = useState(false);

    const fetchCities = async () => {
        if (!authToken) return;
        try {
            const response = await axios.get('http://localhost:8000/api/cities', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setCities(response.data);
        } catch (error) {
            console.error("Gagal mengambil data kota:", error);
        }
    };

    // Effect untuk mengatur fade-in/fade-out
    useEffect(() => {
        if (isOpen) {
            // Reset form dan errors saat form dibuka
            setFormData({
                nim: '', name: '', born_date: '', gender: 'Laki-laki', city: '', address: ''
            });
            setErrors({});
            fetchCities(); // Ambil daftar kota

            // Trigger fade-in setelah sedikit delay agar transisi CSS berlaku
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 50); // Delay kecil (misal 50ms)
            return () => clearTimeout(timer); // Cleanup timer
        } else {
            // Trigger fade-out saat form ditutup dari luar
            setShowContent(false);
        }
    }, [isOpen, authToken]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            await axios.post('http://localhost:8000/api/students', formData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            onStudentAdded(); // Panggil callback setelah berhasil menambahkan
            // Trigger fade-out, lalu tutup form setelah transisi selesai
            setShowContent(false);
            setTimeout(() => {
                onClose();
            }, 300); // Durasi transisi fade-out (sesuaikan dengan duration-300)
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Gagal menambahkan mahasiswa:", error);
            }
        }
    };

    // Komponen hanya akan unmount jika form benar-benar tertutup dan transisi fade-out selesai
    if (!isOpen && !showContent) return null;

    return (
        // Overlay (latar belakang gelap) juga diberi transisi opasitas
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div
                // Konten form diberi transisi untuk opacity dan transform (scale untuk efek zoom)
                className={`bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
                    showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Tambah Mahasiswa Baru</h2>
                    {/* Tombol close: Picu fade-out, lalu panggil onClose setelah delay */}
                    <button onClick={() => { setShowContent(false); setTimeout(onClose, 300); }} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input NIM */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">NIM</label>
                            <input type="text" name="nim" value={formData.nim} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.nim && <p className="text-red-500 text-xs mt-1">{errors.nim[0]}</p>}
                        </div>
                        {/* Input Nama */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Nama</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                        </div>
                        {/* Input Tanggal Lahir */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Tanggal Lahir</label>
                            <input type="date" name="born_date" value={formData.born_date} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            {errors.born_date && <p className="text-red-500 text-xs mt-1">{errors.born_date[0]}</p>}
                        </div>
                        {/* Input Gender */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender[0]}</p>}
                        </div>

                        {/* Dropdown Kota */}
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

                        {/* Input Alamat */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Alamat</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} required rows="4" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address[0]}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        {/* Tombol Batal: Picu fade-out, lalu panggil onClose setelah delay */}
                        <button type="button" onClick={() => { setShowContent(false); setTimeout(onClose, 300); }} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            <FaTimes className="mr-2" /> Batal
                        </button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            <FaSave className="mr-2" /> Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentAddForm;