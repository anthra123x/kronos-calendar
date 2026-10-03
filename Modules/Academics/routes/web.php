<?php

use Illuminate\Support\Facades\Route;
use Modules\Academics\Http\Controllers\AcademicsController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('academics', AcademicsController::class)->names('academics');
});
