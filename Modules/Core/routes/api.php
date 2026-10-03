<?php

use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\DashboardController;

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'summary']);
});
