<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the channels defined in routes/channels.php
        Broadcast::routes([
            'middleware' => ['auth:api'], // Sesuaikan jika menggunakan JWT
        ]);

        require base_path('routes/channels.php');
    }
}
