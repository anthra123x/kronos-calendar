<?php

use Illuminate\Support\Facades\Route;
use Modules\Workspace\Http\Controllers\ProjectController;
use Modules\Workspace\Http\Controllers\TimeEntryController;

Route::middleware('auth:sanctum')->prefix('v1/workspace')->group(function () {
    Route::apiResource('projects', ProjectController::class);

    // Timetracking
    Route::get('time-entries/running', [TimeEntryController::class, 'running']);
    Route::post('time-entries/{timeEntry}/stop', [TimeEntryController::class, 'stop']);
    Route::apiResource('time-entries', TimeEntryController::class)->except(['update']);
});
