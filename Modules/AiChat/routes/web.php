<?php

use Illuminate\Support\Facades\Route;
use Modules\AiChat\Http\Controllers\AiChatController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('aichats', AiChatController::class)->names('aichat');
});
