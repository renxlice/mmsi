<?php

namespace App\Exports;

use App\Models\Order;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;

class OrderExport implements FromCollection, WithMapping, WithHeadings, WithStrictNullComparison
{
    public function collection(): Collection
    {
        return Order::with(['strategist', 'nominee'])->latest()->get();
    }

    public function map($order): array
    {
        return [
            (string) $order->id ?? '-',
            (string) $order->stock ?? '-',
            (float) $order->price ?? 0,
            (int) $order->lots ?? 0,
            (string) $order->order_type ?? '-',
            (string) $order->status ?? '-',
            (string) optional($order->strategist)->name ?? 'N/A',
            (string) optional($order->nominee)->name ?? 'N/A',
            (string) optional($order->created_at)?->format('Y-m-d H:i:s') ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'Order ID',
            'Stock',
            'Price',
            'Lots',
            'Order Type',
            'Status',
            'Strategist Name',
            'Nominee Name',
            'Created At',
        ];
    }
}
