<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;

class SystemController extends Controller
{
    public function autoDeactivate()
    {
        $cutoff = Carbon::now()->subMonths(6);

        $affected = User::where('aktif', true)
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_login_at')
                  ->orWhere('last_login_at', '<', $cutoff);
            })
            ->update(['aktif' => false]);

        return response()->json([
            'status' => 'success',
            'deactivated' => $affected,
            'message' => "Auto-deactivate berhasil. {$affected} user dinonaktifkan.",
        ]);
    }
}
