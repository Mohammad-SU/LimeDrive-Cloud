<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'username',
        'password_hash',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'email',
        'password_hash',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function folders()
    {
        return $this->hasMany(Folder::class, 'user_id');
    }

    public function files()
    {
        return $this->hasMany(File::class, 'user_id');
    }

    public function deleteAccount()
    {
        try {
            DB::beginTransaction();

            $this->files()->delete();
            $this->folders()->delete();
            $this->tokens()->delete();
            $this->delete();

            DB::commit();

            return true; // Account deleted successfully
        } catch (\Exception $e) {
            DB::rollBack();
            return false; // Failed to delete account
        }
    }
}
