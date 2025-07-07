<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Log;
use App\Exports\ActivityLogExport;
use Maatwebsite\Excel\Facades\Excel;

class ActivityLogController extends Controller
{
    /**
     * 🔍 Admin melihat seluruh log aktivitas sistem
     * GET /api/activity-log
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->role !== 'ADMIN') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized. Only admins can access this endpoint.',
                    'data'    => [],
                ], 403);
            }

            $query = ActivityLog::with('user:id,name,email')->orderByDesc('timestamp');

            // ✅ Filter berdasarkan action_type
            if ($request->filled('action_type')) {
                $query->where('action_type', $request->action_type);
            }

            // ✅ Filter berdasarkan rentang tanggal
            if ($request->filled('from') && $request->filled('to')) {
                $query->whereBetween('timestamp', [$request->from, $request->to]);
            }

            // ✅ Pagination
            $logs = $query->paginate($request->get('per_page', 10));

            return response()->json([
                'status'  => 'success',
                'message' => 'Activity logs retrieved successfully.',
                'data'    => $logs,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Failed to fetch activity logs: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch activity logs.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
                'data'    => [],
            ], 500);
        }
    }

    public function strategistLogs(Request $request)
    {
    $user = $request->user();

    if (!$user || $user->role !== 'STRATEGIST') {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized. Only strategists can access their logs.',
            'data' => [],
        ], 403);
    }

    $logs = ActivityLog::with('user:id,name,email')
        ->where('user_id', $user->id)
        ->orderByDesc('timestamp')
        ->limit(100)
        ->get();

    return response()->json([
        'status' => 'success',
        'message' => 'Strategist logs fetched successfully.',
        'data' => $logs,
    ]);
    }

    public function nomineeLogs(Request $request)
    {
    $user = $request->user();

    if (!$user || $user->role !== 'NOMINEE') {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized. Only strategists can access their logs.',
            'data' => [],
        ], 403);
    }

    $logs = ActivityLog::with('user:id,name,email')
        ->where('user_id', $user->id)
        ->orderByDesc('timestamp')
        ->limit(100)
        ->get();

    return response()->json([
        'status' => 'success',
        'message' => 'Nominee logs fetched successfully.',
        'data' => $logs,
    ]);
    }

    /**
     * 📥 Export log aktivitas ke Excel
     * GET /api/activity-log/export
     */
    public function export()
    {
        return Excel::download(new ActivityLogExport, 'activity_logs.xlsx');
    }
}
