import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { FaPlus, FaEye, FaEdit, FaTrash, FaFileExcel, FaFilePdf, FaUpload } from 'react-icons/fa';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import logo from '../university512.png';

import StudentAddForm from '../forms/StudentAddForm';
import StudentDetailForm from '../forms/StudentDetailForm';
import StudentEditForm from '../forms/StudentEditForm';
import StudentDeleteForm from '../forms/StudentDeleteForm';
import StudentImportForm from '../forms/StudentImportForm';

function StudentList() {
    const [allStudents, setAllStudents] = useState([]); 
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const authToken = localStorage.getItem('auth_token');

    // State baru untuk daftar kota unik
    const [cities, setCities] = useState([]); // Menampung daftar kota unik
    // State baru untuk filter kota yang dipilih
    const [selectedCity, setSelectedCity] = useState(''); // Default: semua kota (string kosong)

    // State baru untuk Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 data per halaman

    // State untuk mengontrol visibilitas form tambah
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    // State baru untuk mengontrol visibilitas form detail dan menyimpan ID mahasiswa yang dipilih
    const [isDetailFormOpen, setIsDetailFormOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    // State baru untuk mengontrol visibilitas form edit dan ID
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState(null);
    // State baru untuk mengontrol visibilitas form delete dan ID
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null); // Menyimpan seluruh objek mahasiswa
    // State baru untuk mengontrol visibilitas form import
    const [isImportFormOpen, setIsImportFormOpen] = useState(false);

    // Fungsi untuk mengambil data mahasiswa (dipisah agar bisa dipanggil ulang)
    const fetchStudents = async () => {
        if (!authToken) return;
        try {
            const response = await axios.get('http://localhost:8000/api/students', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setAllStudents(response.data);
            //setFilteredStudents(response.data); // Update filteredStudents juga

            // Ambil daftar kota unik dari data mahasiswa yang baru diambil
            const rawCities = response.data.map(student => student.city);
            const cleanedCities = rawCities
                .map(city => {
                    // Jika city adalah null/undefined, jadikan string kosong
                    if (city === null || city === undefined) {
                        return '';
                    }
                    // Pastikan itu string, lalu trim spasi di awal/akhir
                    return String(city).trim();
                })
                .filter(city => city !== ''); // Hapus string kosong yang tersisa (misalnya dari '   ')

            // Gunakan Set untuk mendapatkan keunikan, lalu urutkan
            const uniqueCities = [...new Set(cleanedCities)].sort();

            // Tambahkan opsi "Semua Kota" di awal
            setCities(['', ...uniqueCities]);
            console.log("Cities state after cleaning and setting:", ['', ...uniqueCities]); // LOG BARU: Pastikan array ini yang masuk
        } catch (error) {
            console.error("Gagal mengambil data mahasiswa:", error);
        }
    };

    useEffect(() => {
        fetchStudents(); // Panggil saat komponen dimuat
    }, [authToken]);

    useEffect(() => {
        let results = allStudents.filter(student =>
            (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nim.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Tambahkan filter kota jika selectedCity tidak kosong
        if (selectedCity) {
            results = results.filter(student => student.city === selectedCity);
        }

        setFilteredStudents(results);
        setCurrentPage(1); // Setiap kali ada pencarian/filter baru, kembali ke halaman 1

        console.log("Selected city:", selectedCity); // LOG 3: Cek nilai selectedCity saat useEffect berjalan
        console.log("Current cities in render:", cities); // LOG 4: Cek array cities sebelum render ulang
    }, [searchTerm, selectedCity, allStudents, cities]);

    // Fungsi yang dipanggil saat tombol hapus di tabel diklik
    const handleDeleteClick = (studentId) => {
        // Cari objek mahasiswa lengkap dari allStudents
        const student = allStudents.find(s => s.id === studentId);
        if (student) {
            setStudentToDelete(student); // Simpan objek lengkap
            setIsDeleteFormOpen(true); // Buka form konfirmasi
        } else {
            console.warn(`Student with ID ${studentId} not found for deletion.`);
        }
    };

    // Fungsi yang dipanggil dari form StudentDeleteForm saat konfirmasi
    const handleConfirmDelete = async () => {
        if (!studentToDelete) return; // Pastikan ada objek mahasiswa yang akan dihapus

        try {
            await axios.delete(`http://localhost:8000/api/students/${studentToDelete.id}`, { // Gunakan studentToDelete.id
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            fetchStudents(); // Refresh data setelah penghapusan
            setIsDeleteFormOpen(false); // Tutup form setelah berhasil
            setStudentToDelete(null); // Reset objek mahasiswa yang akan dihapus
        } catch (error) {
            console.error("Gagal menghapus data mahasiswa:", error);
            // Anda bisa menambahkan notifikasi error di sini jika perlu
            setIsDeleteFormOpen(false); // Tutup form meskipun ada error
            setStudentToDelete(null);
        }
    };

    // Fungsi untuk menutup form delete
    const handleCloseDeleteForm = () => {
        setIsDeleteFormOpen(false);
        setStudentToDelete(null); // Reset objek mahasiswa yang akan dihapus
    };

    // Fungsi untuk membuka form detail
    const handleOpenDetailForm = (studentId) => {
        setSelectedStudentId(studentId);
        setIsDetailFormOpen(true);
    };

    // Fungsi untuk menutup form detail
    const handleCloseDetailForm = () => {
        setIsDetailFormOpen(false);
        setSelectedStudentId(null); // Reset ID setelah ditutup
    };

    // Fungsi untuk membuka form edit
    const handleOpenEditForm = (studentId) => {
        setEditingStudentId(studentId);
        setIsEditFormOpen(true);
    };

    // Fungsi untuk menutup form edit
    const handleCloseEditForm = () => {
        setIsEditFormOpen(false);
        setEditingStudentId(null);
        fetchStudents(); // Refresh data setelah edit selesai
    };
    
    const handleExportExcel = () => {
        const dataForExport = filteredStudents.map((student, index) => ({
            "No.": index + 1,
            "NIM": student.nim,
            "Nama": student.name,
            "Tanggal Lahir": student.born_date,
            "Gender": student.gender,
            "Kota": student.city,
            "Alamat": student.address
        }));

        const customHeaders = ["No.", "NIM", "Nama", "Tanggal Lahir", "Gender", "Kota", "Alamat"];

        const worksheet = XLSX.utils.json_to_sheet(dataForExport, {
            header: customHeaders // Menggunakan header kustom
        });

        const range = XLSX.utils.decode_range(worksheet['!ref']); // Dapatkan rentang sel
        for (let C = range.s.c; C <= range.e.c; ++C) { // Iterasi melalui kolom di baris pertama (header)
            const cellRef = XLSX.utils.encode_cell({ c: C, r: 0 }); // Sel header (baris 0)
            let cell = worksheet[cellRef]; // Dapatkan objek sel yang sudah ada

            // Memastikan objek sel itu sendiri ada
            if (!cell) {
                // Jika sel belum ada, buat objek sel baru dengan tipe string dan nilainya
                // Ini penting karena jika sel tidak ada, style tidak bisa diterapkan
                cell = { t: 's', v: customHeaders[C] };
                worksheet[cellRef] = cell;
            }

            // Memastikan properti 's' (style) ada di objek sel
            if (!cell.s) {
                cell.s = {};
            }

            // Memastikan properti 'font' ada di dalam properti 's'
            if (!cell.s.font) {
                cell.s.font = {};
            }

            // Set properti 'bold' menjadi true di dalam 'font'
            cell.s.font.bold = true;
        }
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mahasiswa");
        XLSX.writeFile(workbook, "Data Mahasiswa.xlsx");
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        doc.addImage(logo, 'PNG', margin, 15, 30, 30);

        // Mengatur font ke Times New Roman (atau font serif generik)
        doc.setFont("Times", "Roman");

        const headerXOffset = 15; // Sesuaikan offset ini sesuai kebutuhan
        const headerCenter = (pageWidth / 2) + headerXOffset;

        doc.setFontSize(11);
        doc.text("KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI", headerCenter, 20, { align: 'center' });
        doc.setFontSize(13);
        doc.text("<NAMA UNIVERSITAS>", headerCenter, 26, { align: 'center' });
        doc.setFontSize(10);
        doc.text("<Alamat lengkap Universitas>", headerCenter, 32, { align: 'center' });
        doc.text("Telepon (0341) ****** Pes. ***-***, 0341-******, Fax. (0341) ******", headerCenter, 37, { align: 'center' });
        doc.text("Laman: www.university.ac.id", headerCenter, 42, { align: 'center' });

        doc.setLineWidth(0.3);
        doc.line(margin, 50, pageWidth - margin, 50);

        doc.setFontSize(14);
        doc.setFont("Times", "Bold");
        doc.text("LAPORAN DATA MAHASISWA", pageWidth / 2, 62, { align: 'center' });

        const startY = 70;

        autoTable(doc, {
            head: [['No.', 'NIM', 'Nama', 'Tanggal Lahir', 'Gender', 'Kota', 'Alamat']],
            body: filteredStudents.map((student, index) => [
                indexOfFirstItem + index + 1,
                student.nim,
                student.name,
                student.born_date,
                student.gender,
                student.city,
                student.address
            ]),
            startY: startY,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                font: 'Times'
            },
            alternateRowStyles: {
                fillColor: [238, 238, 238]
            },
            styles: {
                fontSize: 10,
                cellPadding: 2,
                rowHeight: 5,
                font: 'Times',
                textColor: [0, 0, 0]
            }
        });
        doc.save('Data Mahasiswa.pdf');
    };

    // --- 2. LOGIKA UNTUK PAGINATION ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
    const prevPage = () => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Data Mahasiswa</h1>
                <button
                    onClick={() => setIsAddFormOpen(true)} // Buka form saat diklik
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                    <FaPlus className="mr-2" /> Tambah Mahasiswa
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 mb-2 md:mb-0">
                        <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm">
                            <FaFileExcel className="mr-2" /> Export Excel
                        </button>
                        <button onClick={handleExportPdf} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm">
                            <FaFilePdf className="mr-2" /> Export PDF
                        </button>
                        {/* Tombol Import Data */}
                        <button
                            onClick={() => setIsImportFormOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm"
                        >
                            <FaUpload className="mr-2" /> Import Data
                        </button>
                    </div>
                    {/* Dropdown "Show Entries" */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Show</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border rounded-lg px-2 py-1 text-sm" // Tambah ml-2 untuk jarak
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <label className="text-sm text-gray-600 ml-2">entries</label> {/* Tambah ml-2 */}
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap justify-end w-full md:w-auto">

                        {/* Dropdown Filter Kota */}
                        <div className="w-full md:w-[300px] flex items-center mb-2 md:mb-0"> {/* Tambah ml-4 untuk jarak dari "Show entries" */}
                            <label className="text-sm text-gray-600 mr-2">Filter:</label>
                            <select
                                value={selectedCity}
                                onChange={(e) => {
                                    // Jika nilai yang dipilih adalah '__ALL_CITIES__', set ke string kosong
                                    // Jika tidak, gunakan nilai sebenarnya
                                    //setSelectedCity(e.target.value === '__ALL_CITIES__' ? '' : e.target.value);
                                    //console.log("Selected city changed to:", e.target.value);
                                    setSelectedCity(e.target.value);
                                }}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Semua Kota</option>

                                {/* Map hanya kota-kota yang valid dari array cities.
                                Kita tahu cities sudah berisi "" di awal, jadi kita bisa skip itu. */}
                                {cities.filter(city => city !== '').map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full md:w-[300px] mt-2 md:mt-0 md:ml-4">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan NIM atau Nama"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                           <tr>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">No.</th>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">NIM</th>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Nama</th>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Tanggal Lahir</th>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Kota</th>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {/* --- 4. Render 'currentItems' bukan 'filteredStudents' --- */}
                            {currentItems.map((student, index) => (
                                <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4">{indexOfFirstItem + index + 1}</td>
                                    <td className="py-3 px-4">{student.nim}</td>
                                    <td className="py-3 px-4">{student.name}</td>
                                    <td className="py-3 px-4">{student.born_date}</td>
                                    <td className="py-3 px-4">{student.city}</td>
                                    <td className="py-3 px-4 flex space-x-2">
                                        <button
                                            onClick={() => handleOpenDetailForm(student.id)}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Detail"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEditForm(student.id)} // Buka form edit
                                            className="text-yellow-500 hover:text-yellow-700"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(student.id)} // Hanya meneruskan ID
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* --- 5. Footer Tabel dengan Info dan Tombol Pagination Fungsional --- */}
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-700">
                        Showing {filteredStudents.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                    </span>
                    <div className="flex">
                        <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 border rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <span className="px-3 py-1 border-t border-b bg-gray-200 text-gray-700 text-sm">
                            Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                        </span>
                        <button onClick={nextPage} disabled={currentPage === totalPages || filteredStudents.length === 0} className="px-3 py-1 border rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Render komponen StudentAddForm */}
            <StudentAddForm
                isOpen={isAddFormOpen}
                onClose={() => setIsAddFormOpen(false)} // Fungsi untuk menutup form
                onStudentAdded={fetchStudents} // Fungsi untuk merefresh data setelah penambahan
            />

            {/* Render komponen StudentDetailForm */}
            <StudentDetailForm
                isOpen={isDetailFormOpen}
                onClose={handleCloseDetailForm}
                studentId={selectedStudentId}
            />

            {/* Render komponen StudentEditForm yang baru */}
            <StudentEditForm
                isOpen={isEditFormOpen}
                onClose={handleCloseEditForm}
                studentId={editingStudentId}
                onStudentUpdated={fetchStudents} // Panggil fetchStudents untuk refresh data setelah update
            />

            {/* Render komponen StudentDeleteForm yang baru */}
            <StudentDeleteForm
                isOpen={isDeleteFormOpen}
                onClose={handleCloseDeleteForm}
                onConfirm={handleConfirmDelete} // Fungsi yang akan dieksekusi saat konfirmasi hapus
                studentToDelete={studentToDelete} // Meneruskan seluruh objek mahasiswa
            />

            {/* Render komponen StudentImportForm yang baru */}
            <StudentImportForm
                isOpen={isImportFormOpen}
                onClose={() => setIsImportFormOpen(false)}
                onImportSuccess={fetchStudents}
            />
        </MainLayout>
    );
}

export default StudentList;