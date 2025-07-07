<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NomineeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\RecheckController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Exports\RecheckExport;
use App\Exports\OrderExport;
use App\Exports\ExecutionExport;
use App\Exports\ActivityLogExport;
use Maatwebsite\Excel\Facades\Excel;

/*
|--------------------------------------------------------------------------
| 🌐 PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // 🚫 Max 5 login per minute

/*
|--------------------------------------------------------------------------
| 🔐 PROTECTED ROUTES (JWT Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | 👤 UNIVERSAL ROUTES (All Roles)
    |--------------------------------------------------------------------------
    */
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/verify-pin', [AuthController::class, 'verifyPin']);

    // 🔁 Role-based dashboard redirect
    Route::get('/redirect-dashboard', function (Request $request) {
        $role = strtoupper($request->user()->role);
        return match ($role) {
            'ADMIN'      => response()->json(['redirect_to' => '/admin/dashboard']),
            'STRATEGIST' => response()->json(['redirect_to' => '/strategist/dashboard']),
            'NOMINEE'    => response()->json(['redirect_to' => '/nominee/dashboard']),
            default      => response()->json(['message' => 'Unauthorized role.'], 403),
        };
    });

    /*
    |--------------------------------------------------------------------------
    | 🛡️ ADMIN ONLY
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        Route::post('/register-user', [AuthController::class, 'registerUser']);
        Route::get('/users', [AuthController::class, 'listAllUsers']);
        Route::post('/toggle-user/{id}', [AuthController::class, 'toggleUserAktif']);
        Route::get('/nominees', [AuthController::class, 'listNominees']);
        Route::get('/nominee-instructions', [NomineeController::class, 'adminMonitor']);

        // 📜 Log Aktivitas Admin
        Route::get('/activity-log', [ActivityLogController::class, 'index']);
        Route::get('/activity-log/export', fn () => Excel::download(new ActivityLogExport, 'activity_logs.xlsx'));
    });

    /*
    |--------------------------------------------------------------------------
    | 🧠 STRATEGIST ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('strategist')->group(function () {
        Route::get('/nominees', [AuthController::class, 'listNominees']);

        // 📦 Orders
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::post('/', [OrderController::class, 'store']);
            Route::post('/{id}/status', [OrderController::class, 'updateStatus']);
            Route::get('/export/orders', fn () => Excel::download(new OrderExport, 'orders.xlsx'));
        });

        // 📊 Monitoring & Statistik
        Route::get('/monitor-execution', [OrderController::class, 'monitorExecution']);
        Route::get('/monitor-execution/export', function (Request $request) {
            return Excel::download(new ExecutionExport($request->user()), 'execution_data.xlsx');
        });
        Route::get('/statistics/execution-trend', [OrderController::class, 'getExecutionTrend']);

        // 🧾 Strategist Log
        Route::get('/activity-log', [ActivityLogController::class, 'strategistLogs']);
    });

    /*
    |--------------------------------------------------------------------------
    | 🧑‍💼 NOMINEE ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('nominee')->group(function () {
        Route::get('/instructions', [NomineeController::class, 'instructions']);
        Route::post('/execute/{id}', [NomineeController::class, 'execute']);
        Route::get('/activity-log', [ActivityLogController::class, 'nomineeLogs']);
    });

    /*
    |--------------------------------------------------------------------------
    | 🔁 RECHECK ROUTES (All Roles)
    |--------------------------------------------------------------------------
    */
    Route::get('/recheck', [RecheckController::class, 'index']);
    Route::post('/recheck', [RecheckController::class, 'store']);
    Route::put('/recheck/{id}', [RecheckController::class, 'update']);
    Route::post('/recheck/{id}/verify', [RecheckController::class, 'verify']);
    Route::delete('/recheck/{id}', [RecheckController::class, 'destroy']);
    Route::get('/recheck-summary', [RecheckController::class, 'summary']); 

    // 🔁 Auto Checks (System)
    Route::get('/system/auto-recheck', [RecheckController::class, 'autoRecheck']);
    Route::get('/system/auto-deactivate', [SystemController::class, 'autoDeactivate']);

    // 📥 Export Recheck
    Route::get('/recheck-export', fn () => Excel::download(new RecheckExport, 'rechecks.xlsx'));
});
