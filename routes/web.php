<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Kronos API',
        'status' => 'operational',
        'version' => '1.0.0',
        'database' => 'connected',
        'ai' => 'enabled',
    ]);
});
