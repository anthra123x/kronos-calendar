<?php

use Illuminate\Support\Facades\Route;
use Modules\Tasks\Http\Controllers\TaskController;

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::apiResource('tasks', TaskController::class);
});
