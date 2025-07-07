<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'user',
        'redirect-dashboard',
    ],

    // ✅ Izinkan semua metode (GET, POST, PUT, DELETE, OPTIONS, dsb)
    'allowed_methods' => ['*'],

    // ✅ URL frontend (harus cocok dengan yang di browser)
    'allowed_origins' => [
        'http://localhost:5173',
    ],

    // Jika pakai dynamic subdomain: aktifkan ini (opsional)
    'allowed_origins_patterns' => [],

    // ✅ Izinkan semua header (agar bebas kirim header custom/cookie)
    'allowed_headers' => ['*'],

    // Header yang diizinkan untuk dibaca JS frontend
    'exposed_headers' => [],

    // Waktu cache untuk preflight request (OPTIONS)
    'max_age' => 0,

    // ✅ Wajib true agar session & cookie dikirim dari React
    'supports_credentials' => true,

];
