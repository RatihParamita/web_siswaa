<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <-- Penting, tambahkan ini

class DashboardController extends Controller
{
    public function getStats()
{
    $totalStudents = Student::count();
    $maleStudents = Student::where('gender', 'Laki-laki')->count();
    $femaleStudents = Student::where('gender', 'Perempuan')->count();

    // Menghitung jumlah siswa berdasarkan kota
    $studentsByCity = Student::select('city', DB::raw('count(*) as total'))
                            ->groupBy('city')
                            ->get();

    // --- 1. TAMBAHKAN BLOK KODE BARU DI SINI ---
    // Menghitung jumlah siswa berdasarkan tahun kelahiran
    $studentsByYear = Student::select(DB::raw('YEAR(born_date) as year'), DB::raw('count(*) as total'))
                            ->groupBy('year')
                            ->orderBy('year', 'asc')
                            ->get();
    // -------------------------------------------

    return response()->json([
        'total_students' => $totalStudents,
        'male_students' => $maleStudents,
        'female_students' => $femaleStudents,
        'students_by_city' => $studentsByCity,
        'students_by_year' => $studentsByYear, // <-- 2. TAMBAHKAN DATA BARU DI SINI
    ]);
}
}