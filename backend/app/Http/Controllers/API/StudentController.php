<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
}