<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class StrategistSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('role', 'STRATEGIST')->exists()) {
            User::create([
                'id' => (string) Str::uuid(),
                'name' => 'Default Strategist',
                'email' => env('STRATEGIST_EMAIL', 'strategist@testing.com'),
                'password' => Hash::make(env('STRATEGIST_PASSWORD', 'StrategistUser01!')),
                'role' => 'STRATEGIST',
                'pin' => env('STRATEGIST_PIN', '1234'),
                'aktif' => true,
            ]);
        }
    }
}
