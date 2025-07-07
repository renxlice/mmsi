<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

// ✅ Import command jika belum otomatis terdaftar
use App\Console\Commands\DeactivateInactiveUsers;

class Kernel extends ConsoleKernel
{
    /**
     * Daftar command aplikasi.
     *
     * @var array
     */
    protected $commands = [
        DeactivateInactiveUsers::class, // ⬅️ Pastikan command ini didaftarkan
    ];

    /**
     * Daftarkan schedule command.
     */
    protected function schedule(Schedule $schedule)
    {
        // ✅ Jalankan command setiap hari pada pukul 00:00
        $schedule->command('users:deactivate-inactive')->dailyAt('00:00');
    }

    /**
     * Daftarkan command untuk aplikasi.
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
