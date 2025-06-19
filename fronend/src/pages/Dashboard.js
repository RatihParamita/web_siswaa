import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout'; // Import layout utama kita
import { FaUsers, FaMale, FaFemale } from 'react-icons/fa';
// 1. Import komponen-komponen baru untuk Bar Chart dari ChartJS
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2'; // 2. Import komponen <Bar>

// 3. Daftarkan komponen-komponen baru agar bisa digunakan
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

// Komponen kecil untuk menampilkan kartu statistik agar lebih rapi
const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 ${color}`}>
        {icon}
        <div className="ml-4">
            <div className="text-gray-500">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    </div>
);


function Dashboard() {
    const [stats, setStats] = useState(null);
    const authToken = localStorage.getItem('auth_token');

    // Mengambil data statistik dari backend saat komponen pertama kali dimuat
    useEffect(() => {
        const fetchStats = async () => {
            if (!authToken) return;
            try {
                const response = await axios.get('http://localhost:8000/api/dashboard-stats', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Gagal mengambil data statistik:", error);
            }
        };
        fetchStats();
    }, [authToken]);

    // Data untuk Grafik Gender (Doughnut)
    const genderChartData = {
        labels: ['Perempuan', 'Laki-laki'],
        datasets: [{
            label: 'Jumlah Siswa',
            data: [stats?.female_students || 0, stats?.male_students || 0],
            backgroundColor: ['#ec4899', '#3b82f6'], // Warna Pink & Biru
            borderColor: ['#ffffff'],
            borderWidth: 2,
        }]
    };
    
    // Data untuk Grafik Kota (Pie)
    const cityChartData = {
        labels: stats?.students_by_city.map(c => c.city) || [],
        datasets: [{
            label: 'Jumlah Siswa',
            data: stats?.students_by_city.map(c => c.total) || [],
            backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#eab308', '#8b5cf6', '#ef4444'],
            borderColor: '#ffffff',
            borderWidth: 2,
        }]
    };

    // 4. Siapkan data untuk Grafik Tahun Kelahiran (Bar Chart)
    const yearChartData = {
        labels: stats?.students_by_year.map(item => item.year) || [],
        datasets: [{
            label: 'Jumlah Kelahiran Siswa',
            data: stats?.students_by_year.map(item => item.total) || [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
        }]
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Sembunyikan legenda karena sudah jelas dari judul
            },
            title: {
                display: true,
                text: 'Total Mahasiswa berdasarkan Tahun Kelahiran',
                font: {
                    size: 20,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1 // Pastikan skala Y hanya menampilkan angka bulat (1, 2, 3, bukan 1.5)
                }
            }
        }
    };

    // Tampilkan loading jika data belum siap
    if (!stats) {
        return (
            <MainLayout>
                <p>Loading...</p>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Admin</h1>
            
            {/* Bagian Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<FaUsers size={32} className="text-yellow-500" />} label="Total Students" value={stats.total_students} color="border-yellow-500" />
                <StatCard icon={<FaMale size={32} className="text-blue-500" />} label="Male Students" value={stats.male_students} color="border-blue-500" />
                <StatCard icon={<FaFemale size={32} className="text-pink-500" />} label="Female Students" value={stats.female_students} color="border-pink-500" />
            </div>

            {/* Bagian Grafik Atas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Total Mahasiswa berdasarkan Gender</h2>
                    <div className="max-w-xs mx-auto"><Doughnut data={genderChartData} /></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Total Mahasiswa berdasarkan Kota</h2>
                    <div className="max-w-xs mx-auto"><Pie data={cityChartData} /></div>
                </div>
            </div>

            {/* 5. Tambahkan elemen JSX untuk grafik baru di bawah ini */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <Bar options={barChartOptions} data={yearChartData} />
            </div>
        </MainLayout>
    );
}

export default Dashboard;