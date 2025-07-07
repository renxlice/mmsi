<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Order;
use App\Models\OrderBreakdown;
use App\Models\User;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil user dengan role STRATEGIST dan NOMINEE
        $strategist = User::where('role', 'STRATEGIST')->first();
        $nominee = User::where('role', 'NOMINEE')->first();

        // Pastikan keduanya ada
        if (!$strategist || !$nominee) {
            echo "Strategist or Nominee user not found. Please seed users first.\n";
            return;
        }

        // Buat 3 order dummy
        for ($i = 1; $i <= 3; $i++) {
            $orderId = Str::uuid();

            $order = Order::create([
                'id' => $orderId,
                'stock' => 'BBCA',
                'price' => 8500 + ($i * 10), // harga berbeda-beda
                'lots' => 10 * $i,
                'order_type' => 'Buy',
                'status' => 'NEW',
                'source_user' => $strategist->id,
                'selected_target' => json_encode([$nominee->id]),
            ]);

            // Breakdown (instruksi untuk nominee)
            OrderBreakdown::create([
                'order_id' => $order->id,
                'nominee_id' => $nominee->id,
                'broker_code' => 'BR00' . $i,
                'broker_id' => 'BX1' . rand(10, 99),
                'stock' => $order->stock,
                'price' => $order->price,
                'lots' => $order->lots,
                'status' => 'WAITING',
            ]);
        }

        echo "✅ Dummy orders and breakdowns inserted successfully.\n";
    }
}
