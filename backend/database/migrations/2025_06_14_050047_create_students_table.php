<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('students', function (Blueprint $table) {
        $table->id();
        $table->string('nim')->unique();
        $table->string('name');
        $table->date('born_date');
        $table->string('gender'); // 'Laki-laki' atau 'Perempuan'
        $table->string('city');
        $table->text('address');
        $table->timestamps(); // created_at dan updated_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
