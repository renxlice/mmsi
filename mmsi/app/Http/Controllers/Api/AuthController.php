<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * 🔐 Login JWT (email + password + pin)
     */
    public function login(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string|min:6',
        'pin'      => 'required|string|min:4',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['error' => 'Email tidak ditemukan.'], 401);
    }

    if (!Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Password salah.'], 401);
    }

    if (!Hash::check($request->pin, $user->pin)) {
        return response()->json(['error' => 'PIN salah.'], 401);
    }

    if (!$user->aktif) {
        return response()->json(['error' => 'Akun Anda telah dinonaktifkan.'], 403);
    }

    try {
        $token = JWTAuth::fromUser($user);
        $user->last_login_at = now();
        $user->save();

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
            'user'         => $user,
        ]);
    } catch (JWTException $e) {
        return response()->json(['error' => 'Gagal membuat token.'], 500);
    }
}

    /**
     * ✅ Get user yang sedang login (via JWT)
     */
    public function me()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            return response()->json(['user' => $user]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token tidak valid.'], 401);
        }
    }

    /**
     * 🔓 Logout (invalidate token)
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Logout berhasil.']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Logout gagal.'], 500);
        }
    }

    /**
     * 👥 Admin: Register User
     */
    public function registerUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'pin'      => 'required|string|min:4',
            'role'     => 'required|in:ADMIN,STRATEGIST,NOMINEE',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'pin'      => Hash::make($request->pin),
            'role'     => strtoupper($request->role),
            'aktif'    => true,
        ]);

        return response()->json([
            'message' => 'User berhasil didaftarkan.',
            'user'    => $user,
        ], 201);
    }

    /**
     * 👤 Admin: List semua user
     */
    public function listAllUsers()
    {
        $users = User::orderBy('name')
            ->select('id', 'name', 'email', 'role', 'aktif', 'last_login_at')
            ->get();

        return response()->json(['users' => $users]);
    }

    /**
     * 🔄 Admin: Aktif/Nonaktifkan user
     */
    public function toggleUserAktif($id)
    {
        $user = User::findOrFail($id);
        $user->aktif = !$user->aktif;
        $user->save();

        return response()->json([
            'message' => 'Status akun diperbarui.',
            'user'    => $user,
        ]);
    }

    /**
     * ✅ Admin & Strategist: List nominee aktif
     */
    public function listNominees()
    {
        $nominees = User::where('role', 'NOMINEE')
            ->where('aktif', true)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json([
            'status'   => 'success',
            'message'  => 'Nominee aktif ditemukan.',
            'nominees' => $nominees,
        ]);
    }

    /**
 * ✅ Verifikasi PIN Strategist (untuk submit order)
 */
    public function verifyPin(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|min:4',
        ]);

        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['error' => 'User tidak ditemukan.'], 401);
        }

        if (!Hash::check($request->pin, $user->pin)) {
            return response()->json(['error' => 'PIN tidak sesuai.'], 403);
        }

        return response()->json(['message' => 'PIN valid.']);
    }
}
