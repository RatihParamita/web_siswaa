import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

import CityDeleteForm from '../forms/CityDeleteForm';

function CityList() {
    const [cities, setCities] = useState([]);
    const authToken = localStorage.getItem('auth_token');

    // --- 1. State baru untuk mengelola form ---
    const [editingCity, setEditingCity] = useState(null); // Menyimpan data kota yang sedang diedit
    const [formData, setFormData] = useState({ name: '' }); // Data untuk input form
    const [errors, setErrors] = useState({}); // Untuk error validasi

    // --- State baru untuk form konfirmasi hapus ---
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [cityToDelete, setCityToDelete] = useState(null); // Menyimpan kota yang akan dihapus

    // Fungsi untuk mengambil data kota dari API
    const fetchCities = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/cities', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setCities(response.data);
        } catch (error) {
            console.error("Gagal mengambil data kota:", error);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    // --- 2. Fungsi-fungsi baru untuk menangani form ---

    // Dipanggil saat tombol "Add City" diklik
    const handleAdd = () => {
        setEditingCity(null); // Pastikan tidak dalam mode edit
        setFormData({ name: '' }); // Kosongkan form
        setErrors({});
    };

    // Dipanggil saat ikon pensil (edit) diklik
    const handleEdit = (city) => {
        setEditingCity(city); // Masuk ke mode edit dengan data kota yang dipilih
        setFormData({ name: city.name }); // Isi form dengan nama kota yang akan diedit
        setErrors({});
    };
    
    // Dipanggil saat form di-submit (untuk Add maupun Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const url = editingCity 
            ? `http://localhost:8000/api/cities/${editingCity.id}` // URL untuk update
            : 'http://localhost:8000/api/cities'; // URL untuk create
        
        const method = editingCity ? 'put' : 'post';

        try {
            await axios[method](url, formData, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            fetchCities(); // Refresh daftar kota
            handleAdd(); // Reset form ke mode "Add"
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                alert(`Gagal ${editingCity ? 'memperbarui' : 'menambahkan'} kota.`);
            }
        }
    };
    
    // --- Fungsi untuk membuka form konfirmasi hapus ---
    const confirmDelete = (city) => {
        setCityToDelete(city); // Simpan data kota yang akan dihapus
        setShowDeleteForm(true); // Tampilkan form
    };

    // --- Fungsi untuk menutup form konfirmasi hapus ---
    const cancelDelete = () => {
        setShowDeleteForm(false);
        setCityToDelete(null); // Kosongkan data kota yang akan dihapus
    };

    // --- Fungsi yang benar-benar melakukan penghapusan ---
    const executeDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/cities/${id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            fetchCities(); // Refresh daftar kota
            cancelDelete(); // Tutup form setelah berhasil dihapus
        } catch (error) {
            alert('Gagal menghapus kota.');
            console.error("Error deleting city:", error);
            cancelDelete(); // Tetap tutup form meskipun gagal
        }
    };

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Data Kota</h1>
            
            {/* --- 3. Form untuk Add/Edit Kota --- */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4">{editingCity ? 'Edit Kota' : 'Tambah Kota'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row items-start md:items-end space-y-2 md:space-y-0 md:space-x-4">
                        <div className="flex-grow w-full">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                        </div>
                        <div className="flex space-x-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                <FaSave className="mr-2" /> {editingCity ? 'Simpan' : 'Simpan'}
                            </button>
                            {editingCity && (
                                <button type="button" onClick={handleAdd} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                    <FaTimes className="mr-2" /> Batal
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Tabel Daftar Kota */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">No.</th>
                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Nama</th>
                            <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {cities.map((city, index) => (
                            <tr key={city.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4">{index + 1}</td>
                                <td className="py-3 px-4">{city.name}</td>
                                <td className="py-3 px-4 flex space-x-4">
                                    <button onClick={() => handleEdit(city)} className="text-yellow-500 hover:text-yellow-700" title="Edit"><FaEdit /></button>
                                    <button onClick={() => confirmDelete(city)} className="text-red-500 hover:text-red-700" title="Hapus"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Render form konfirmasi hapus */}
            {showDeleteForm && (
                <CityDeleteForm
                    city={cityToDelete}
                    onClose={cancelDelete}
                    onDelete={executeDelete} // Panggil executeDelete saat tombol hapus di form diklik
                />
            )}
        </MainLayout>
    );
}

export default CityList;