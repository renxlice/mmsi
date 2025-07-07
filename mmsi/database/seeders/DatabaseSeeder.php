<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ✅ Jalankan seeder untuk masing-masing role
        $this->call([
            AdminSeeder::class,
            StrategistSeeder::class,
            NomineeSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
