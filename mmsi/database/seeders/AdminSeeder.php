<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Cek apakah sudah ada admin
        if (!User::where('role', 'ADMIN')->exists()) {
            User::create([
                'id' => (string) Str::uuid(),
                'name' => 'Super Admin',
                'email' => env('ADMIN_EMAIL', 'admin@super.com'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'DeveloperAsAdmin01!')),
                'role' => 'ADMIN',
                'pin' => env('ADMIN_PIN', '1005'),
                'aktif' => true,
            ]);
        }
    }
}

