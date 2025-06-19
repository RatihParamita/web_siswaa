import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaDatabase, FaUserGraduate, FaCity, FaUserCircle, FaSignOutAlt, FaChevronDown, FaBars } from 'react-icons/fa';
import axios from 'axios';

// --- KOMPONEN SIDEBAR ---
const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
    const submenuRef = useRef(null); // Membuat ref untuk elemen submenu

    const isActive = (path) => location.pathname.startsWith(path);
    const isDataActive = isActive('/students') || isActive('/cities');

    useEffect(() => {
        if (isDataActive) {
            setIsDataMenuOpen(true);
        }
        // Jika sidebar ditutup, dropdown menu juga ikut tertutup
        if (!isOpen) {
            setIsDataMenuOpen(false);
        }
    }, [isDataActive, isOpen]);

    // Fungsi untuk mendapatkan tinggi submenu yang sebenarnya untuk animasi
    const getSubmenuHeight = () => {
        return submenuRef.current ? submenuRef.current.scrollHeight : 0;
    };

    return (
        <div className={`h-screen bg-gray-800 text-white flex flex-col fixed transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            {/* Header Sidebar */}
            <div className={`text-xl font-bold p-5 border-b border-gray-700 flex items-center ${!isOpen && 'justify-center'}`}>
                {isOpen && <span>University Dashboard</span>}
            </div>

            {/* Navigasi */}
            <nav className="flex-grow p-4">
                <ul>
                    <li className={`mb-1 rounded-lg ${isActive('/dashboard') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
                        <Link to="/dashboard" className="flex items-center p-3">
                            <FaTachometerAlt size={20} />
                            {/* Teks hanya muncul jika sidebar terbuka */}
                            <span className={`ml-4 transition-opacity duration-200 ${!isOpen && 'opacity-0 hidden'}`}>Dashboard</span>
                        </Link>
                    </li>
                    <li className="mb-1 rounded-lg">
                        <button onClick={() => isOpen && setIsDataMenuOpen(!isDataMenuOpen)} className={`w-full flex justify-between items-center p-3 rounded-lg ${isDataActive ? 'bg-blue-600' : 'hover:bg-gray-700'} ${!isOpen && 'justify-center'}`}>
                            <div className="flex items-center">
                                <FaDatabase size={20} />
                                <span className={`ml-4 transition-opacity duration-200 ${!isOpen && 'opacity-0 hidden'}`}>Data</span>
                            </div>
                            {isOpen && <FaChevronDown className={`transition-transform duration-300 ${isDataMenuOpen ? 'transform rotate-180' : ''}`} />}
                        </button>
                        {/* --- ANIMASI SLIDE --- */}
                        <ul
                            ref={submenuRef} // Sambungkan ref ke elemen ul
                            className={`
                                overflow-hidden transition-all duration-300 ease-in-out
                                ${isDataMenuOpen ? 'opacity-100' : 'opacity-0'}
                                ${isOpen ? 'pl-4 mt-1' : ''}
                            `}
                            style={{
                                maxHeight: isDataMenuOpen ? `${getSubmenuHeight()}px` : '0px',
                                // Menghindari `display: none` saat tertutup agar transisi tetap jalan
                                // Namun, jika sidebar tertutup, tetap menyembunyikan submenu
                                display: !isOpen && !isDataMenuOpen ? 'none' : 'block'
                            }}
                        >
                            <li className={`mb-1 rounded-lg ${isActive('/students') ? 'bg-blue-500' : 'hover:bg-gray-600'}`}>
                                <Link to="/students" className="flex items-center p-2 pl-5"><FaUserGraduate className="mr-3" /> Mahasiswa</Link>
                            </li>
                            <li className={`mb-1 rounded-lg ${isActive('/cities') ? 'bg-blue-500' : 'hover:bg-gray-600'}`}>
                                <Link to="/cities" className="flex items-center p-2 pl-5"><FaCity className="mr-3" /> Kota</Link>
                            </li>
                        </ul>
                        {/* --- AKHIR ANIMASI SLIDE --- */}
                    </li>
                </ul>
            </nav>
        </div>
    );
};

// --- KOMPONEN HEADER ---
// ... (Bagian Header dan MainLayout tetap sama seperti sebelumnya) ...
const Header = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const authToken = localStorage.getItem('auth_token');

    const handleLogout = async () => {
        const authToken = localStorage.getItem('auth_token'); // Ambil token saat ini

        try {
            // --- Bagian Opsional untuk Komunikasi Backend ---
            // HANYA AKAN DIEKSEKUSI JIKA ada authToken dan Anda ingin logout dari backend
            if (authToken) {
                await axios.post('http://8000/api/logout', {}, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                console.log("Berhasil logout dari backend."); // Log untuk debugging
            }
        } catch (error) {
            // --- Penanganan Eror Komunikasi Backend (tidak akan menghentikan logout frontend) ---
            console.error("Gagal logout dari backend:", error);
            // Pesan eror ini hanya muncul di konsol jika backend gagal merespons.
            // Ini TIDAK akan membuat frontend crash atau tombol tidak berfungsi.
        } finally {
            // --- Bagian Wajib untuk Logout Frontend ---
            // Ini SELALU akan dieksekusi, baik komunikasi backend berhasil/gagal.
            localStorage.removeItem('auth_token'); // Hapus token utama
            localStorage.removeItem('user_name'); // Hapus informasi pengguna lain jika ada
            console.log("Token autentikasi dan nama pengguna telah dihapus dari localStorage."); // Log untuk debugging

            // Redirect pengguna ke halaman login
            navigate('/login');
            console.log("Pengguna diarahkan ke halaman login."); // Log untuk debugging
        }
    };

    return (
        <header className="w-full bg-white shadow-md p-4 pr-9 flex justify-between items-center">
            {/* Tombol Hamburger untuk Buka/Tutup Sidebar */}
            <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-800">
                <FaBars size={24} />
            </button>
            <div className='flex items-center'>
                <div className="flex items-center mr-6">
                    <span className="mr-3">{localStorage.getItem('user_name')}</span>
                    <FaUserCircle size={28} className="text-gray-600" />
                </div>
                <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700">
                    <FaSignOutAlt className="mr-2" />
                    Logout
                </button>
            </div>
        </header>
    );
};

// --- KOMPONEN LAYOUT UTAMA ---
const MainLayout = ({ children }) => {
    // State untuk mengontrol sidebar sekarang ada di sini (komponen induk)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Kirim state dan fungsi sebagai props ke anak-anaknya */}
            <Sidebar isOpen={isSidebarOpen} />
            {/* Margin kiri konten utama berubah berdasarkan state sidebar */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header toggleSidebar={toggleSidebar} />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;