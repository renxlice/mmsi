<?php

namespace App\Exports;

use App\Models\Recheck;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class RecheckExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Recheck::all()->map(function ($item) {
            return [
                'tanggal' => $item->tanggal,
                'kas' => $item->kas,
                'portofolio' => is_array($item->portofolio) ? json_encode($item->portofolio) : $item->portofolio,
                'admin' => $item->admin_name ?? '-',
                'nominee' => $item->nominee->name ?? '-',
                'verifikasi' => $item->verifikasi_admin_1 ? '✅' : '❌',
            ];
        });
    }

    public function headings(): array
    {
        return ['Tanggal', 'Kas', 'Portofolio', 'Admin', 'Nominee', 'Verifikasi'];
    }
}

