<?php

namespace App\Exports;

use App\Models\OrderBreakdown;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ExecutionExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $user;

    public function __construct($user)
    {
        $this->user = $user;
    }

    /**
     * Ambil data breakdown berdasarkan strategist yang login
     */
    public function collection()
    {
        return OrderBreakdown::with(['nominee:id,name', 'order:id,stock,order_type,strategist_id'])
            ->whereHas('order', fn($q) => $q->where('strategist_id', $this->user->id))
            ->orderByDesc('execution_time')
            ->get();
    }

    /**
     * Judul kolom di Excel
     */
    public function headings(): array
    {
        return [
            'ID',
            'Nominee',
            'Stock',
            'Price',
            'Lots',
            'Status',
            'Executed At',
            'Execution Type',
        ];
    }

    /**
     * Format isi setiap baris
     */
    public function map($breakdown): array
    {
        return [
            $breakdown->id,
            $breakdown->nominee->name ?? '-',
            $breakdown->stock,
            $breakdown->price,
            $breakdown->lots,
            $breakdown->status,
            $breakdown->execution_time ? $breakdown->execution_time->format('Y-m-d H:i') : '-',
            $breakdown->auto_executed ? 'Auto' : 'Manual',
        ];
    }
}
