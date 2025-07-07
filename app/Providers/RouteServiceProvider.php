<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Path to the "home" route for your application.
     *
     * @var string
     */
    public const HOME = '/';

    /**
     * Define your route model bindings, pattern filters, etc.
     */
    public function boot(): void
    {
        $this->routes(function () {
            // ========================
            // 📦 API Routes
            // ========================
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // ========================
            // 🖥️ Web Routes
            // ========================
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
