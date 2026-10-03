<?php

use Illuminate\Support\Facades\Route;
use Modules\AiChat\Http\Controllers\ConversationController;

Route::middleware('auth:sanctum')->prefix('v1/chat')->group(function () {
    Route::post('conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
    Route::apiResource('conversations', ConversationController::class)->except(['update']);
});
