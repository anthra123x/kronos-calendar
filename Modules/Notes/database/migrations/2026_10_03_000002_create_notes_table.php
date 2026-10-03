<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('project_id')->nullable()->index();
            $table->string('title');
            $table->string('slug');
            $table->longText('content')->nullable();
            $table->enum('format', ['markdown', 'html', 'plain'])->default('markdown');
            $table->enum('category', ['personal', 'work', 'university', 'idea', 'other'])->default('personal');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_favorite')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'is_pinned']);
            $table->index(['user_id', 'is_favorite']);
            $table->unique(['user_id', 'slug']);
        });

        // Tabla para archivos adjuntos en notas
        Schema::create('note_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('note_id')->constrained()->cascadeOnDelete();
            $table->string('filename');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->string('path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_attachments');
        Schema::dropIfExists('notes');
    }
};
