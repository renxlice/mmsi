<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Order;
use App\Models\OrderBreakdown;
use App\Models\ActivityLog;

class OrderController extends Controller
{
    /**
     * ✅ Get all orders for current strategist
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->role !== 'STRATEGIST') {
                return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
            }

            $orders = Order::with('breakdowns')
                ->where('strategist_id', $user->id)
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => $orders,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Gagal mengambil orders strategist', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id ?? 'null',
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Server error saat mengambil orders.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * ✅ Create new order from strategist
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'stock'             => 'required|string|max:50',
                'price'             => 'required|numeric|min:1',
                'lots'              => 'required|integer|min:1',
                'order_type'        => 'required|in:Buy,Sell,Withdraw',
                'selected_target'   => 'required|array|min:1',
                'selected_target.*' => 'exists:users,id',
                'pin'               => 'required|string|min:4|max:10',
            ]);

            $user = $request->user();

            if (!$user || $user->role !== 'STRATEGIST') {
                return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
            }

            // ✅ Validasi PIN Strategist
            if (!Hash::check($validated['pin'], $user->pin)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'PIN Strategist tidak valid.',
                ], 403);
            }

            DB::beginTransaction();

            Log::info('Creating order', ['user' => $user->id, 'payload' => $validated]);

            $nomineeIds = $validated['selected_target'];
            $totalLots = $validated['lots'];
            $lotsPerNominee = intdiv($totalLots, count($nomineeIds));
            $remainderLots = $totalLots % count($nomineeIds);
            $firstNominee = $nomineeIds[0];

            $order = Order::create([
                'id'              => (string) Str::uuid(),
                'stock'           => $validated['stock'],
                'price'           => $validated['price'],
                'lots'            => $totalLots,
                'order_type'      => $validated['order_type'],
                'status'          => 'NEW',
                'source_user'     => $user->id,
                'strategist_id'   => $user->id,
                'nominee_id'      => $firstNominee,
                'selected_target' => json_encode($nomineeIds),
            ]);

            foreach ($nomineeIds as $index => $nomineeId) {
                $assignedLots = $lotsPerNominee + ($index < $remainderLots ? 1 : 0);

                OrderBreakdown::create([
                    'order_id'      => $order->id,
                    'nominee_id'    => $nomineeId,
                    'broker_code'   => 'AUTO',
                    'broker_id'     => 'AUTO',
                    'stock'         => $validated['stock'],
                    'price'         => $validated['price'],
                    'lots'          => $assignedLots,
                    'status'        => 'WAITING',
                    'auto_executed' => false,
                ]);
            }

            // ✅ Simpan ke activity_logs
            ActivityLog::create([
                'id'          => (string) Str::uuid(),
                'user_id'     => $user->id,
                'action_type' => 'CREATE_ORDER',
                'detail'      => "Strategist {$user->name} membuat order {$order->stock} ({$order->order_type}) sebanyak {$order->lots} lot untuk " . count($nomineeIds) . " nominee.",
                'timestamp'   => now(),
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Order created and distributed successfully.',
                'data'    => $order,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'user'  => optional($request->user())->id,
                'input' => $request->all(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to create order.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * ✅ Monitor eksekusi order breakdown untuk strategist
     */
    public function monitorExecution(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'STRATEGIST') {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        $data = OrderBreakdown::with(['order', 'nominee'])
            ->whereHas('order', fn($q) => $q->where('strategist_id', $user->id))
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Execution data fetched.',
            'data' => $data,
        ]);
    }

    /**
     * ✅ Grafik statistik eksekusi per hari
     * GET /api/statistics/execution-trend
     */
    public function getExecutionTrend(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'STRATEGIST') {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        $data = DB::table('order_breakdowns')
            ->join('orders', 'order_breakdowns.order_id', '=', 'orders.id')
            ->selectRaw('DATE(order_breakdowns.execution_time) as tanggal, COUNT(*) as jumlah')
            ->where('orders.strategist_id', $user->id)
            ->where('order_breakdowns.status', 'EXECUTED')
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}
