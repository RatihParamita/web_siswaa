<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon; // Import Carbon untuk parsing tanggal

class StudentController extends Controller
{
    /**
     * Menampilkan semua data siswa.
     */
    public function index()
    {
        $students = Student::latest()->get();
        return response()->json($students, 200);
    }

    /**
     * Menyimpan data siswa baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nim'       => 'required|unique:students,nim',
            'name'      => 'required|string|max:255',
            'born_date' => 'required|date',
            'gender'    => 'required|string',
            'city'      => 'required|string',
            'address'   => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $student = Student::create($request->all());

        return response()->json([
            'message' => 'Data siswa berhasil ditambahkan',
            'data' => $student
        ], 201);
    }

    /**
     * Menampilkan data satu siswa spesifik (untuk halaman Detail & Edit).
     */
    public function show(Student $student)
    {
        return response()->json($student, 200);
    }

    /**
     * Memperbarui data siswa di database (untuk proses Edit).
     */
    public function update(Request $request, Student $student)
    {
        $validator = Validator::make($request->all(), [
            'nim'       => 'required|unique:students,nim,'.$student->id,
            'name'      => 'required|string|max:255',
            'born_date' => 'required|date',
            'gender'    => 'required|string',
            'city'      => 'required|string',
            'address'   => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $student->update($request->all());

        return response()->json([
            'message' => 'Data siswa berhasil diperbarui',
            'data' => $student
        ], 200);
    }

    /**
     * Menghapus data siswa dari database.
     */
    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(['message' => 'Data siswa berhasil dihapus'], 200);
    }

    /**
     * Mengimpor data siswa dari file Excel.
     */
    public function import(Request $request)
    {
        // Pastikan hanya user terautentikasi yang bisa mengimpor
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Validasi array 'students' yang dikirim dari frontend
        $validator = Validator::make($request->all(), [
            'students' => 'required|array',
            'students.*.nim' => 'required|string|unique:students,nim', // Pastikan NIM unik
            'students.*.name' => 'required|string|max:255',
            'students.*.born_date' => 'required|date_format:Y-m-d', // Perhatikan format tanggal YYYY-MM-DD
            'students.*.gender' => 'required|string', // Jika gender juga ada di import
            'students.*.city' => 'required|string', // Sesuai dengan kolom 'city' di tabel
            'students.*.address' => 'required|string', // Jika address juga ada di import
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi data gagal', 'errors' => $validator->errors()], 422);
        }

        $importedCount = 0;
        $failedCount = 0;
        $errors = [];

        foreach ($request->students as $studentData) {
            try {
                // Ambil nilai gender dan address, atau set default jika tidak ada di import (tergantung template)
                $gender = $studentData['gender'] ?? 'Unknown'; // Default jika gender tidak ada di Excel
                $address = $studentData['address'] ?? '-'; // Default jika address tidak ada di Excel


                Student::create([
                    'nim' => $studentData['nim'],
                    'name' => $studentData['name'],
                    // Pastikan born_date di-parse dan diformat dengan benar
                    'born_date' => Carbon::parse($studentData['born_date'])->format('Y-m-d'),
                    'gender' => $studentData['gender'], // Menggunakan nilai yang ditentukan
                    'city' => $studentData['city'], // Langsung menggunakan string kota
                    'address' => $studentData['address'], // Menggunakan nilai yang ditentukan
                ]);
                $importedCount++;
            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = "Gagal mengimpor NIM: {$studentData['nim']} - " . $e->getMessage();
            }
        }

        if ($importedCount > 0 && $failedCount === 0) {
            return response()->json(['message' => "Berhasil mengimpor {$importedCount} data mahasiswa."], 200);
        } elseif ($importedCount > 0 && $failedCount > 0) {
            return response()->json([
                'message' => "Berhasil mengimpor {$importedCount} data mahasiswa, tetapi {$failedCount} data gagal diimpor.",
                'errors' => $errors
            ], 200);
        } else {
            return response()->json(['message' => 'Tidak ada data mahasiswa yang berhasil diimpor.', 'errors' => $errors], 400);
        }
    }
}