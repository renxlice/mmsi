<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Recheck extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
    'id',
    'nominee_id',
    'tanggal',
    'kas',
    'portofolio',
    'verifikasi_admin_1',
    'timestamp_verifikasi',
    'admin_name',
    'admin_id',
    ];


    protected $casts = [
        'portofolio' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }

    public function admin()
    {
    return $this->belongsTo(User::class, 'admin_id');
    }

    public function nominee()
    {
    return $this->belongsTo(User::class, 'nominee_id');
    }

}
