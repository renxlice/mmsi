<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Override redirectTo agar REST API tidak redirect, tapi balas JSON.
     */
    protected function redirectTo($request): ?string
    {
        if ($request->expectsJson()) {
            abort(401, 'Unauthenticated.');
        }

        return '/login'; // kamu bisa ubah sesuai SPA login route, atau abaikan
    }
}
