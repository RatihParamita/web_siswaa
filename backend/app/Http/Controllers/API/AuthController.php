<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Menangani permintaan login.
     */
    public function login(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Coba otentikasi user
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Email atau Password salah'], 401);
        }

        // Cari user berdasarkan email
        $user = User::where('email', $request->email)->firstOrFail();

        // Buat token menggunakan Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Kembalikan response sukses dengan token dan data user
        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Mengambil data user yang sedang login.
     */
    public function user(Request $request)
    {
        return $request->user();
    }

    /**
     * Menangani permintaan logout.
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }
}