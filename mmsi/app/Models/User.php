<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'name', 'email', 'password', 'role', 'pin', 'aktif'
    ];

    protected $hidden = [
        'password', 'pin', 'remember_token',
    ];

    public function setPinAttribute($value)
    {
        if (!empty($value)) {
            $this->attributes['pin'] = bcrypt($value);
        }
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }

    /**
     * ✅ JWT: Return the identifier stored in the token.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey(); // biasanya ID
    }

    /**
     * ✅ JWT: Return custom claims for the token (optional)
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}
