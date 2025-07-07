<?php

use Illuminate\Support\Facades\Route;
use App\Exports\OrderExport;
use App\Exports\RecheckExport;
use Maatwebsite\Excel\Facades\Excel;

// =========================
// ✅ Export Routes (khusus Laravel)
// =========================
Route::get('/export/orders', function () {
    return Excel::download(new OrderExport, 'orders.xlsx');
})->name('export.orders');

Route::get('/export/rechecks', function () {
    return Excel::download(new RecheckExport, 'rechecks.xlsx');
})->name('export.rechecks');

// =========================
// ✅ Catch-all route untuk React SPA (HARUS DI BAWAH)
// =========================
Route::get('/{any}', function () {
    return view('app'); // Blade view yang memuat React
})->where('any', '^(?!api|panel|laravel|export).*$');
