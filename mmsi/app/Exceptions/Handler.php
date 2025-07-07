<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    // ... mungkin ada method lain di sini

    /**
     * Override unauthenticated() to return JSON on API requests
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Redirect fallback (opsional, jika buka dari browser)
        return redirect()->guest('/');
    }
}
