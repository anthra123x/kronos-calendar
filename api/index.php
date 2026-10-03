<?php

// Fix Vercel SCRIPT_NAME / PHP_SELF stripping /api from pathinfo
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

// Initialize temporary storage directories for Vercel's read-only filesystem
$storageDirectories = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
    '/tmp/storage/app',
];

foreach ($storageDirectories as $dir) {
    if (! is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Forward to public/index.php
require __DIR__.'/../public/index.php';
