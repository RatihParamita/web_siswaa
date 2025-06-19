import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FaUpload, FaDownload, FaTimes, FaSpinner } from 'react-icons/fa';

const StudentImportForm = ({ isOpen, onClose, onImportSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(''); // Untuk pesan sukses/error
    const authToken = localStorage.getItem('auth_token');

    // State baru untuk mengontrol efek fade (opacity dan scale)
    const [showContent, setShowContent] = useState(false);
    // State baru untuk mengontrol rendering komponen setelah fade-out
    const [shouldRender, setShouldRender] = useState(isOpen); // Awalnya sesuaikan dengan isOpen prop

    // Effect untuk mengatur fade-in/fade-out dan rendering
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true); // Pastikan komponen dirender untuk fade-in
            // Reset state form atau pesan saat form dibuka
            setSelectedFile(null);
            setMessage('');
            setIsLoading(false);

            // Trigger fade-in setelah sedikit delay agar transisi CSS berlaku
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 50); // Delay kecil (misal 50ms)
            return () => clearTimeout(timer); // Cleanup timer
        } else {
            // Trigger fade-out saat form ditutup
            setShowContent(false);
            // Tunggu hingga transisi selesai sebelum menghilangkan komponen dari DOM
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Durasi transisi opacity (sesuaikan dengan 'duration-300')
            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [isOpen]);

    // Jika shouldRender false, jangan render apa-apa
    if (!shouldRender) return null;

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage(''); // Bersihkan pesan saat file baru dipilih
    };

    const handleDownloadTemplate = () => {
        const headers = ["NIM", "Nama", "Tanggal Lahir (YYYY-MM-DD)", "Gender", "Kota", "Alamat"]; // Sesuaikan header
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template Mahasiswa");
        XLSX.writeFile(wb, "Template_Import_Mahasiswa.xlsx");
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setMessage('Pilih file Excel terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        setMessage(''); // Reset pesan

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                // Mengambil data sebagai JSON, tanpa header (header: 1)
                // Ini akan mengembalikan array of arrays, dengan baris pertama sebagai header
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    setMessage('File Excel kosong atau tidak ada data.');
                    setIsLoading(false);
                    return;
                }

                // Asumsi baris pertama adalah header dan data dimulai dari baris kedua
                const headers = jsonData[0]; // Baris pertama adalah header
                const studentsToImport = [];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows

                    const student = {};
                    // Mapping header ke key yang diharapkan oleh backend
                    // Pastikan urutan dan nama header di template sesuai dengan ini
                    student.nim = row[headers.indexOf("NIM")]?.toString();
                    student.name = row[headers.indexOf("Nama")]?.toString();
                    student.born_date = row[headers.indexOf("Tanggal Lahir (YYYY-MM-DD)")]?.toString();
                    student.gender = row[headers.indexOf("Gender")]?.toString();
                    student.city = row[headers.indexOf("Kota")]?.toString();
                    student.address = row[headers.indexOf("Alamat")]?.toString();

                    // Validasi dasar (bisa diperluas)
                    if (!student.nim || !student.name || !student.born_date || !student.gender || !student.city || !student.address) {
                        console.warn(`Skipping row ${i + 1} due to missing data:`, row);
                        setMessage(`Peringatan: Baris ${i + 1} mungkin memiliki data tidak lengkap dan dilewati.`);
                        continue;
                    }
                    studentsToImport.push(student);
                }

                if (studentsToImport.length === 0) {
                    setMessage('Tidak ada data mahasiswa yang valid ditemukan di file.');
                    setIsLoading(false);
                    return;
                }

                // Kirim data ke backend
                const response = await axios.post('http://localhost:8000/api/students/import', { students: studentsToImport }, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                setMessage(response.data.message || 'Data berhasil diimpor!');
                onImportSuccess(); // Refresh tabel setelah impor
                setSelectedFile(null); // Reset file
                // onClose(); // Opsional: tutup form otomatis setelah sukses
            } catch (error) {
                console.error("Error importing data:", error.response?.data || error.message);
                setMessage(error.response?.data?.message || 'Gagal mengimpor data. Pastikan format file benar.');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    return (
        // Menggunakan showContent untuk opacity dan scale
        <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50
                      transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            // Tambahkan onClick untuk menutup form saat mengklik di luar area konten
            // Namun pastikan tidak menutup saat transisi fade-out
            onClick={onClose}
        >
            <div
                className={`bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4
                          transform transition-transform duration-300 ${showContent ? 'scale-100' : 'scale-95'}`}
                onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam form menutup form
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Impor Data Mahasiswa</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-gray-700 text-sm mb-3">
                        Gunakan fitur ini untuk mengimpor data mahasiswa dari file Excel (.xlsx).
                        Pastikan format file Anda sesuai dengan template yang disediakan.
                    </p>
                    <button
                        onClick={handleDownloadTemplate}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm mb-4"
                    >
                        <FaDownload className="mr-2" /> Unduh Template Excel
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="file-upload" className="block text-gray-700 text-sm font-bold mb-2">
                        Pilih File Excel:
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                    />
                    {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600">File terpilih: {selectedFile.name}</p>
                    )}
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Gagal') || message.includes('Peringatan') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleImport}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                        disabled={isLoading || !selectedFile}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" /> Importing...
                            </>
                        ) : (
                            <>
                                <FaUpload className="mr-2" /> Impor
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentImportForm;