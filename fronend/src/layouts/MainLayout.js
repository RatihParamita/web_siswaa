import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaDatabase, FaUserGraduate, FaCity, FaUserCircle, FaSignOutAlt, FaChevronDown, FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';

import logo from '../university512.png';

// --- KOMPONEN SIDEBAR ---
// Ini adalah daftar lengkap menu, termasuk sub-menu
const menuConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: FaTachometerAlt
    },
    {
        id: 'data',
        label: 'Data',
        path: '#', // '#' menandakan ini adalah parent/dropdown, bukan link langsung
        icon: FaDatabase,
        children: [
            { id: 'students', label: 'Mahasiswa', path: '/students', icon: FaUserGraduate },
            { id: 'cities', label: 'Kota', path: '/cities', icon: FaCity }
        ]
    }
];

const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    // Gunakan state terpisah untuk membuka dropdown berdasarkan pencarian
    const [isDataMenuOpenForSearch, setIsDataMenuOpenForSearch] = useState(false);
    const [isDataMenuOpen, setIsDataMenuOpen] = useState(false); // Untuk normal dropdown
    const submenuRef = useRef(null); // Membuat ref untuk elemen submenu

    // State untuk nilai input search
    const [searchTerm, setSearchTerm] = useState('');

    const isActive = (path) => location.pathname.startsWith(path);
    const isDataActive = isActive('/students') || isActive('/cities');

    useEffect(() => {
        if (isDataActive) {
            setIsDataMenuOpen(true);
        }
        // Jika sidebar ditutup, dropdown menu juga ikut tertutup dan search term dikosongkan
        if (!isOpen) {
            setIsDataMenuOpen(false);
            setIsDataMenuOpenForSearch(false); // Pastikan ini juga tertutup
            setSearchTerm('');
        }
    }, [isDataActive, isOpen]);

    // Fungsi untuk mendapatkan tinggi submenu yang sebenarnya untuk animasi
    const getSubmenuHeight = () => {
        return submenuRef.current ? submenuRef.current.scrollHeight : 0;
    };

    // Handler ketika input search berubah
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handler untuk membersihkan search term
    const clearSearch = () => {
        setSearchTerm('');
        setIsDataMenuOpenForSearch(false); // Pastikan dropdown search tertutup saat clear
    };

    // Logika filtering yang lebih kompleks:
    // Mengembalikan struktur menu yang sama, tetapi dengan item yang tidak cocok disaring.
    // Jika parent cocok atau memiliki anak yang cocok, parent akan disertakan.
    const filteredMenu = useMemo(() => {
        if (!searchTerm.trim()) {
            return menuConfig; // Jika tidak ada search term, tampilkan semua menu
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const results = [];

        menuConfig.forEach(item => {
            const parentMatches = item.label.toLowerCase().includes(lowerCaseSearchTerm);

            if (item.children) {
                // Filter anak-anak yang cocok
                const matchedChildren = item.children.filter(child =>
                    child.label.toLowerCase().includes(lowerCaseSearchTerm)
                );

                if (parentMatches || matchedChildren.length > 0) {
                    // Jika parent cocok atau memiliki anak yang cocok, sertakan parent
                    results.push({
                        ...item,
                        // Hanya sertakan anak-anak yang cocok jika ada
                        children: matchedChildren.length > 0 ? matchedChildren : (parentMatches ? item.children : [])
                    });
                    // Jika ada hasil pencarian dan parent ini memiliki anak yang cocok,
                    // maka kita ingin dropdownnya otomatis terbuka
                    if (item.id === 'data' && (parentMatches || matchedChildren.length > 0)) {
                        setIsDataMenuOpenForSearch(true);
                    }
                }
            } else if (parentMatches) {
                // Jika item top-level cocok
                results.push(item);
            }
        });
        return results;
    }, [searchTerm]); // Dependensi: searchTerm

    return (
        <div className={`h-screen bg-gray-800 text-white flex flex-col fixed transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            {/* Header Sidebar */}
            <div className={`text-xl font-bold p-5 border-b border-gray-700 flex items-center ${!isOpen && 'justify-center'}`}>
                {isOpen && (
                    <div className="flex items-center">
                        <img
                            src={logo}
                            alt="University Logo"
                            className="h-8 w-8 mr-3"
                            style={{ filter: 'brightness(0) invert(1) sepia(1) hue-rotate(200deg) saturate(5)' }} // Filter untuk mendapatkan warna abu-abu
                        />
                        <span>University Web</span>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            {isOpen && (
                <div className="p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-4 pr-10 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm ? (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                                title="Clear search"
                            >
                                <FaTimes size={20} />
                            </button>
                        ) : (
                            <FaSearch size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        )}
                    </div>
                </div>
            )}

            {/* Navigasi */}
            <nav className="flex-grow p-4">
                <ul>
                    {filteredMenu.length > 0 ? (
                        filteredMenu.map(item => (
                            <React.Fragment key={item.id}>
                                {item.path !== '#' ? ( // Item menu biasa (bukan dropdown)
                                    <li className={`mb-1 rounded-lg ${isActive(item.path) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
                                        <Link to={item.path} className="flex items-center p-3">
                                            {item.icon && <item.icon size={20} />}
                                            <span className={`ml-4 transition-opacity duration-200 ${!isOpen && 'opacity-0 hidden'}`}>{item.label}</span>
                                        </Link>
                                    </li>
                                ) : ( // Item menu dengan anak (dropdown)
                                    <li className="mb-1 rounded-lg">
                                        <button
                                            onClick={() => isOpen && setIsDataMenuOpen(!isDataMenuOpen)}
                                            className={`w-full flex justify-between items-center p-3 rounded-lg ${isDataActive && item.id === 'data' ? 'bg-blue-600' : 'hover:bg-gray-700'} ${!isOpen && 'justify-center'}`}
                                        >
                                            <div className="flex items-center">
                                                {item.icon && <item.icon size={20} />}
                                                <span className={`ml-4 transition-opacity duration-200 ${!isOpen && 'opacity-0 hidden'}`}>{item.label}</span>
                                            </div>
                                            {isOpen && <FaChevronDown className={`transition-transform duration-300 ${(isDataMenuOpen || (searchTerm && isDataMenuOpenForSearch && item.id === 'data')) ? 'transform rotate-180' : ''}`} />}
                                        </button>
                                        <ul
                                            ref={submenuRef} // Ref untuk animasi tinggi
                                            className={`
                                                overflow-hidden transition-all duration-300 ease-in-out
                                                ${(isDataMenuOpen || (searchTerm && isDataMenuOpenForSearch && item.id === 'data')) ? 'opacity-100' : 'opacity-0'}
                                                ${isOpen ? 'pl-4 mt-1' : ''}
                                            `}
                                            style={{
                                                // MaxHeight disesuaikan untuk selalu terbuka saat ada pencarian yang cocok
                                                maxHeight: (isDataMenuOpen || (searchTerm && isDataMenuOpenForSearch && item.id === 'data')) ? `${getSubmenuHeight()}px` : '0px',
                                                display: !isOpen && !isDataMenuOpen && !(searchTerm && isDataMenuOpenForSearch && item.id === 'data') ? 'none' : 'block'
                                            }}
                                        >
                                            {/* Render hanya anak-anak yang ada di item.children yang sudah difilter */}
                                            {item.children.map(child => (
                                                <li key={child.id} className={`mb-1 rounded-lg ${isActive(child.path) ? 'bg-blue-500' : 'hover:bg-gray-600'}`}>
                                                    <Link to={child.path} className="flex items-center p-2 pl-5">
                                                        {child.icon && <child.icon className="mr-3" />} {child.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <li className="p-3 text-gray-400">Tidak ada hasil ditemukan.</li>
                    )}
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