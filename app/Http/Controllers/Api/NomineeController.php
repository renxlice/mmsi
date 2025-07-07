<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\OrderBreakdown;
use App\Models\ActivityLog;
use App\Events\OrderUpdated;

class NomineeController extends Controller
{
    /**
     * 🧑‍💼 Nominee mengambil instruksi miliknya (status: WAITING)
     */
    public function instructions(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->role !== 'NOMINEE') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized. Only nominees can access this endpoint.',
                    'data'    => [],
                ], 403);
            }

            $instructions = OrderBreakdown::with('order.strategist')
                ->where('nominee_id', $user->id)
                ->where('status', 'WAITING')
                ->orderByDesc('created_at')
                ->get();

            // ✅ Log pengambilan instruksi
            ActivityLog::create([
                'id'          => (string) Str::uuid(),
                'user_id'     => $user->id,
                'action_type' => 'VIEW_INSTRUCTIONS',
                'detail'      => "Nominee {$user->name} melihat {$instructions->count()} instruksi.",
                'timestamp'   => now(),
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Instructions fetched successfully.',
                'data'    => $instructions,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Error fetching nominee instructions: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch instructions.',
                'error'   => $e->getMessage(),
                'data'    => [],
            ], 500);
        }
    }

    /**
     * 🟣 Nominee mengeksekusi instruksi (ubah status breakdown jadi EXECUTED)
     */
    public function execute(Request $request, $id)
    {
        try {
            $user = $request->user();

            if ($user->role !== 'NOMINEE') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized. Only nominees can execute.',
                ], 403);
            }

            // Cari breakdown dengan validasi nominee_id
            $breakdown = OrderBreakdown::with('nominee', 'order')
                ->where('id', $id)
                ->where('nominee_id', $user->id)
                ->first();

            if (!$breakdown) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Instruksi tidak ditemukan atau bukan milik Anda.',
                ], 404);
            }

            if ($breakdown->status !== 'WAITING') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Instruksi sudah dieksekusi atau tidak valid.',
                ], 400);
            }

            // Eksekusi
            $breakdown->status = 'EXECUTED';
            $breakdown->execution_time = now();
            $breakdown->auto_executed = true;
            $breakdown->save();

            // Log aktivitas
            ActivityLog::create([
                'id'          => (string) Str::uuid(),
                'user_id'     => $user->id,
                'action_type' => 'EXECUTE_ORDER',
                'detail'      => sprintf(
                    "Nominee %s mengeksekusi order %s (stock: %s, lots: %s)",
                    $user->name,
                    $breakdown->id,
                    $breakdown->stock ?? '-',
                    $breakdown->lots ?? '-'
                ),
                'timestamp'   => now(),
            ]);

            // ✅ Broadcast real-time
            try {
                if ($breakdown->order) {
                    broadcast(new OrderUpdated($breakdown->order))->toOthers();
                }
            } catch (\Throwable $broadcastError) {
                Log::warning('⚠️ Gagal broadcast OrderUpdated: ' . $broadcastError->getMessage());
                // Tidak menghentikan eksekusi meski gagal broadcast
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Instruction executed successfully.',
                'data'    => $breakdown,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Execution failed: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to execute instruction.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 🛡️ ADMIN melihat seluruh instruksi nominee
     */
    public function adminMonitor(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->role !== 'ADMIN') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized. Only admins can access this endpoint.',
                    'data'    => [],
                ], 403);
            }

            $instructions = OrderBreakdown::with(['order.strategist', 'nominee'])
                ->orderByDesc('created_at')
                ->get();

            // ✅ Log monitoring oleh admin
            ActivityLog::create([
                'id'          => (string) Str::uuid(),
                'user_id'     => $user->id,
                'action_type' => 'ADMIN_MONITOR',
                'detail'      => "Admin {$user->name} membuka data seluruh instruksi nominee. Total: {$instructions->count()}",
                'timestamp'   => now(),
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'All nominee instructions fetched successfully.',
                'data'    => $instructions,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Admin monitor error: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to load nominee instructions.',
                'error'   => $e->getMessage(),
                'data'    => [],
            ], 500);
        }
    }
}
