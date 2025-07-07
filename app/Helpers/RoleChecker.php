<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class RoleChecker
{
    public static function onlyAdmin()
    {
        $user = Auth::user();
        if (!$user || strtoupper($user->role) !== 'ADMIN') {
            abort(403, 'Unauthorized. Admin only.');
        }
    }

    public static function onlyStrategist()
    {
        $user = Auth::user();
        if (!$user || strtoupper($user->role) !== 'STRATEGIST') {
            abort(403, 'Unauthorized. Strategist only.');
        }
    }

    public static function onlyNominee()
    {
        $user = Auth::user();
        if (!$user || strtoupper($user->role) !== 'NOMINEE') {
            abort(403, 'Unauthorized. Nominee only.');
        }
    }
}
