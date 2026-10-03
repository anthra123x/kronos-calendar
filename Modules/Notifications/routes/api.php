<?php

use Illuminate\Support\Facades\Route;
use Modules\Notifications\Http\Controllers\NotificationController;

Route::middleware('auth:sanctum')->prefix('v1/notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::post('{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('{notification}', [NotificationController::class, 'destroy']);
});
