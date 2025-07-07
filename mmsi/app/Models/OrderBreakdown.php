<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class OrderBreakdown extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $attributes = [
        'status'        => 'WAITING',
        'auto_executed' => false,
    ];

    protected $fillable = [
        'id',
        'order_id',
        'nominee_id',
        'broker_code',
        'broker_id',
        'stock',
        'price',
        'lots',
        'status',
        'execution_time',
        'auto_executed',
    ];

    protected $casts = [
        'price'          => 'float',
        'lots'           => 'integer',
        'execution_time' => 'datetime',
        'auto_executed'  => 'boolean',
    ];

    protected $appends = ['strategist_name'];

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
     * 🔗 Relasi ke Order induk.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id')->withDefault([
            'stock' => null,
            'price' => 0,
        ]);
    }

    /**
     * 🔗 Relasi ke User sebagai Nominee.
     */
    public function nominee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nominee_id')->withDefault([
            'name' => 'Unknown Nominee',
        ]);
    }

    /**
     * 🔗 Relasi ke Strategist via Order.
     */
    public function strategist(): HasOneThrough
    {
        return $this->hasOneThrough(
            User::class,
            Order::class,
            'id',             // Foreign key di Order
            'id',             // Foreign key di User
            'order_id',       // Local key di OrderBreakdown
            'strategist_id'   // Local key di Order
        );
    }

    /**
     * 🎯 Dapatkan nama strategist dari relasi order.
     */
    public function getStrategistNameAttribute(): string
    {
        return $this->order->strategist->name ?? 'N/A';
    }

    /**
     * 💬 Label status readable (opsional untuk response API).
     */
    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'WAITING'     => '⏳ Waiting',
            'IN_PROGRESS' => '🚧 In Progress',
            'COMPLETED'   => '✅ Completed',
            'EXECUTED'    => '⚡ Executed',
            'NEW'         => '🆕 New',
            default       => ucfirst($this->status),
        };
    }
}
