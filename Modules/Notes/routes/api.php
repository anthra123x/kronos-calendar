<?php

use Illuminate\Support\Facades\Route;
use Modules\Notes\Http\Controllers\NoteController;

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::apiResource('notes', NoteController::class);
});
