<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Di sini kamu dapat mendaftarkan semua saluran event yang akan digunakan
| oleh aplikasi Laravel Echo dan Pusher/WebSocket.
|
*/

// ✅ Contoh channel publik
Broadcast::channel('orders', function () {
    return true; // Public channel, tidak perlu autentikasi
});

// ✅ Contoh channel privat berdasarkan user login (jika dibutuhkan)
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// ✅ Channel privat untuk nominee tertentu (bisa digunakan untuk push notifikasi individual)
Broadcast::channel('nominee.{id}', function ($user, $id) {
    return $user->id === (int) $id && $user->role === 'NOMINEE';
});

// ✅ Channel privat untuk strategist (misalnya jika ada notifikasi balik)
Broadcast::channel('strategist.{id}', function ($user, $id) {
    return $user->id === (int) $id && $user->role === 'STRATEGIST';
});
