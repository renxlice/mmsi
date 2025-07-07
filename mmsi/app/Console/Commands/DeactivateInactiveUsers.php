<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;

class DeactivateInactiveUsers extends Command
{
    /**
     * Nama dan signature dari perintah console.
     *
     * @var string
     */
    protected $signature = 'users:deactivate-inactive';

    /**
     * Deskripsi perintah ini.
     *
     * @var string
     */
    protected $description = 'Deactivate users who have not logged in for more than 6 months';

    /**
     * Jalankan perintah console.
     */
    public function handle()
    {
        $cutoffDate = Carbon::now()->subMonths(6);

        $users = User::where('aktif', true)
            ->where(function ($query) use ($cutoffDate) {
                $query->whereNull('last_login_at')
                      ->orWhere('last_login_at', '<', $cutoffDate);
            })
            ->get();

        foreach ($users as $user) {
            $user->aktif = false;
            $user->save();
            $this->info("✅ Deactivated: {$user->email}");
        }

        $this->info("🎯 Done. Total deactivated users: " . $users->count());
    }
}
