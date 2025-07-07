<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Vite Manifest Path
    |--------------------------------------------------------------------------
    |
    | Laravel akan membaca file manifest.json dari lokasi ini untuk memuat
    | semua assets (JS, CSS) React yang dibangun menggunakan Vite.
    |
    */

    'manifest_path' => public_path('panel/build/.vite/manifest.json'),

    /*
    |--------------------------------------------------------------------------
    | Hot Reload File (development only)
    |--------------------------------------------------------------------------
    |
    | Saat menggunakan `npm run dev`, Vite akan membuat file `hot` di folder
    | public. Laravel akan memeriksa file ini untuk mengarahkan ke dev server.
    |
    | Pada production server, file ini tidak perlu ada dan tidak digunakan.
    |
    */

    'hot_file' => public_path('hot'),

    /*
    |--------------------------------------------------------------------------
    | Dev Server URL (optional)
    |--------------------------------------------------------------------------
    |
    | Saat file `hot` ditemukan, Laravel akan mencoba mengakses Vite Dev
    | Server. Jika gagal, kamu bisa set URL dev server manual di sini.
    | Biasanya hanya untuk development lokal.
    |
    */

    // 'dev_server_url' => 'http://localhost:5173',

];
