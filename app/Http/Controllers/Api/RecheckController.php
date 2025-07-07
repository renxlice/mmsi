<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Recheck;
use App\Models\ActivityLog;

class RecheckController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'tanggal'     => 'required|date',
            'kas'         => 'required|numeric',
            'portofolio'  => 'required|array|min:1',
            'pin'         => 'required|string|min:4',
        ]);

        $user = $request->user();

        if (!Hash::check($request->pin, $user->pin)) {
            return response()->json(['message' => 'PIN salah'], 403);
        }

        $filteredPorto = array_filter($request->portofolio, function ($val, $key) {
            return trim($key) !== '' && is_numeric($val);
        }, ARRAY_FILTER_USE_BOTH);

        if (empty($filteredPorto)) {
            return response()->json(['message' => 'Portofolio tidak boleh kosong atau invalid.'], 422);
        }

        $data = [
            'tanggal'     => $request->tanggal,
            'kas'         => $request->kas,
            'portofolio'  => json_encode($filteredPorto),
        ];

        if ($user->role === 'ADMIN') {
            $data['admin_id']   = $user->id;
            $data['admin_name'] = $user->name;
        } elseif ($user->role === 'NOMINEE') {
            $data['nominee_id'] = $user->id;
        } else {
            return response()->json(['message' => 'Role tidak diizinkan untuk melakukan recheck.'], 403);
        }

        $recheck = Recheck::create($data);

        ActivityLog::create([
            'id'          => (string) Str::uuid(),
            'user_id'     => $user->id,
            'action_type' => 'RECHECK_SUBMIT',
            'detail'      => "{$user->role} {$user->name} mengirim recheck tanggal {$request->tanggal} senilai kas: {$request->kas}",
            'timestamp'   => now(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Recheck berhasil disimpan.',
            'data'    => $recheck,
        ]);
    }

    public function destroy($id)
    {
        $recheck = Recheck::findOrFail($id);
        $user = request()->user();

        ActivityLog::create([
            'id'          => (string) Str::uuid(),
            'user_id'     => $user->id,
            'action_type' => 'RECHECK_DELETE',
            'detail'      => "{$user->role} {$user->name} menghapus recheck tanggal {$recheck->tanggal}",
            'timestamp'   => now(),
        ]);

        $recheck->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Recheck berhasil dihapus.',
        ]);
    }

    public function autoRecheck(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['ADMIN', 'NOMINEE'])) {
            return response()->json(['message' => 'Not allowed'], 403);
        }

        $alreadyToday = Recheck::where('tanggal', today()->toDateString())
            ->where(function ($q) use ($user) {
                $userCol = $user->role === 'ADMIN' ? 'admin_id' : 'nominee_id';
                $q->where($userCol, $user->id);
            })->exists();

        if ($alreadyToday) {
            return response()->json(['message' => 'Recheck already exists today.']);
        }

        return response()->json(['message' => 'Belum ada recheck hari ini. Silakan isi recheck secara manual.']);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Recheck::orderBy('tanggal', 'desc');

        if ($user->role === 'NOMINEE') {
            $query->where('nominee_id', $user->id);
        }

        if (!in_array($user->role, ['ADMIN', 'NOMINEE'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses tidak diizinkan untuk role ini.',
            ], 403);
        }

        return $query->get();
    }

    public function verify(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $recheck = Recheck::findOrFail($id);
        $recheck->verifikasi_admin_1 = true;
        $recheck->timestamp_verifikasi = now();
        $recheck->save();

        ActivityLog::create([
            'id'          => (string) Str::uuid(),
            'user_id'     => $user->id,
            'action_type' => 'RECHECK_VERIFY',
            'detail'      => "Admin {$user->name} memverifikasi recheck tanggal {$recheck->tanggal}",
            'timestamp'   => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Recheck berhasil diverifikasi.',
            'data' => $recheck,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'kas' => 'required|numeric',
            'portofolio' => 'required|array',
        ]);

        $recheck = Recheck::findOrFail($id);
        $recheck->update([
            'tanggal' => $request->tanggal,
            'kas' => $request->kas,
            'portofolio' => json_encode($request->portofolio),
        ]);

        $user = $request->user();

        ActivityLog::create([
            'id'          => (string) Str::uuid(),
            'user_id'     => $user->id,
            'action_type' => 'RECHECK_UPDATE',
            'detail'      => "{$user->role} {$user->name} memperbarui recheck tanggal {$request->tanggal}",
            'timestamp'   => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Recheck diperbarui',
        ]);
    }

    public function summary(Request $request)
    {
        $user = $request->user();

        $query = Recheck::query();

        if ($user->role === 'NOMINEE') {
            $query->where('nominee_id', $user->id);
        } elseif ($user->role === 'ADMIN') {
            // Admin bisa melihat semua
        } elseif ($user->role === 'STRATEGIST') {
            // Strategist hanya melihat ringkasan, tapi tidak terbatas user_id
            // Bisa tambahkan filter jika perlu
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $query->get();

        $totalKas = $data->sum('kas');

        $totalPortofolio = $data->reduce(function ($carry, $item) {
            $porto = json_decode($item->portofolio, true);
            if (!is_array($porto)) return $carry;
            return $carry + array_sum($porto);
        }, 0);

        $verified = $data->where('verifikasi_admin_1', true)->count();
        $unverified = $data->where('verifikasi_admin_1', false)->count();

        return response()->json([
            'totalKas' => $totalKas,
            'totalPortofolio' => $totalPortofolio,
            'verifiedCount' => $verified,
            'unverifiedCount' => $unverified,
        ]);
    }
}
