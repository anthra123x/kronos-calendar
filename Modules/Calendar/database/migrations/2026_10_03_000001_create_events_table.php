<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('color', 7)->default('#FBBF24');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->boolean('is_all_day')->default(false);
            $table->enum('category', ['personal', 'work', 'university', 'other'])->default('personal');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            // Recurrencia (RRULE simplificado)
            $table->boolean('is_recurring')->default(false);
            $table->enum('recurrence_type', ['daily', 'weekly', 'monthly', 'yearly'])->nullable();
            $table->integer('recurrence_interval')->nullable();
            $table->date('recurrence_end_date')->nullable();
            $table->jsonb('recurrence_days')->nullable(); // Para weekly: ["MO","WE","FR"]
            $table->uuid('parent_event_id')->nullable();
            $table->string('reminder')->nullable(); // "15min", "1hour", "1day"
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'starts_at', 'ends_at']);
            $table->index(['user_id', 'category']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreign('parent_event_id')->references('id')->on('events')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
