<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Períodos académicos (semestres)
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // "2026-2", "Semestre 8"
            $table->date('starts_at');
            $table->date('ends_at');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_current']);
        });

        // Materias
        Schema::create('subjects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('academic_period_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable(); // "MAT-301"
            $table->string('professor')->nullable();
            $table->string('classroom')->nullable();
            $table->string('color', 7)->default('#60A5FA');
            $table->integer('credits')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'academic_period_id']);
        });

        // Horarios de clase
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subject_id')->constrained()->cascadeOnDelete();
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('starts_at');
            $table->time('ends_at');
            $table->string('classroom')->nullable();
            $table->timestamps();

            $table->index(['subject_id', 'day_of_week']);
        });

        // Calificaciones
        Schema::create('grades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subject_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // "Parcial 1", "Trabajo final"
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->default(5.00);
            $table->decimal('weight', 5, 2)->default(1.00); // Peso porcentual
            $table->date('date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('subject_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
        Schema::dropIfExists('class_schedules');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('academic_periods');
    }
};
