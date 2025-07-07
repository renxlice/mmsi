<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    /**
     * Menggunakan UUID sebagai primary key.
     */
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    /**
     * Mass assignable fields.
     */
    protected $fillable = [
        'id',
        'stock',
        'price',
        'lots',
        'order_type',
        'status',
        'selected_target',
        'source_user',       // Legacy field
        'strategist_id',     // ✅ Strategist foreign key
        'nominee_id',        // ✅ Nominee foreign key
        'execution_time',    // ✅ Untuk record eksekusi
    ];

    /**
     * Casting kolom ke tipe data native.
     */
    protected $casts = [
        'price'           => 'float',
        'lots'            => 'integer',
        'selected_target' => 'array',      // Auto-convert JSON
        'execution_time'  => 'datetime',   // Untuk formatting otomatis
    ];

    /**
     * Event model: generate UUID saat creating.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    /**
     * 🔗 Relasi ke user yang membuat order (Strategist).
     */
    // Order.php
        // App\Models\Order.php

    public function strategist()
    {
        return $this->belongsTo(User::class, 'strategist_id');
    }

    public function nominee()
    {
        return $this->belongsTo(User::class, 'nominee_id');
    }



    /**
     * 🔗 Relasi ke semua breakdown dari order ini.
     */
    public function breakdowns()
    {
        return $this->hasMany(OrderBreakdown::class, 'order_id');
    }
}
