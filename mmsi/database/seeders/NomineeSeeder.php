<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class NomineeSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('role', 'NOMINEE')->exists()) {
            User::create([
                'id' => (string) Str::uuid(),
                'name' => 'Default Nominee',
                'email' => env('NOMINEE_EMAIL', 'nominee1@testing.com'),
                'password' => Hash::make(env('NOMINEE_PASSWORD', 'NomineeUser01!')),
                'role' => 'NOMINEE',
                'pin' => env('NOMINEE_PIN', '123456'),
                'aktif' => true,
            ]);
        }
    }
}
