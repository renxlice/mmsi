<?php

namespace App\Exports;

use App\Models\ActivityLog;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ActivityLogExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * Ambil semua log terbaru (maks 1000)
     */
    public function collection()
    {
        return ActivityLog::with('user:id,name,email')
            ->orderByDesc('timestamp')
            ->limit(1000)
            ->get();
    }

    /**
     * Judul kolom Excel
     */
    public function headings(): array
    {
        return [
            'ID',
            'Nama User',
            'Email',
            'User ID',
            'Action Type',
            'Detail',
            'Timestamp',
        ];
    }

    /**
     * Format setiap baris data
     */
    public function map($log): array
    {
        return [
            $log->id,
            $log->user->name ?? '',
            $log->user->email ?? '',
            $log->user_id,
            $log->action_type,
            $log->detail,
            $log->timestamp,
        ];
    }
}
