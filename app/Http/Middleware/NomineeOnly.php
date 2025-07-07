<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Helpers\RoleChecker;

class NomineeOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        RoleChecker::onlyNominee(); 

        return $next($request);
    }
}
