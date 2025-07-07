<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Helpers\RoleChecker;

class StrategistOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        RoleChecker::onlyStrategist(); 

        return $next($request);
    }
}
