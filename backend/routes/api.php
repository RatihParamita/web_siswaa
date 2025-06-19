<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\StudentController; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\DashboardController; 
use App\Http\Controllers\API\CityController; 

// Rute publik, tidak perlu login
Route::post('/login', [AuthController::class, 'login']);

// Rute yang dilindungi, HARUS login untuk mengakses
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rute untuk CRUD Student
    Route::apiResource('students', StudentController::class);

    Route::get('/dashboard-stats', [DashboardController::class, 'getStats']); 

    Route::apiResource('cities', CityController::class);

    Route::post('/students/import', [StudentController::class, 'import']);
});