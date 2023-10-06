<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $table = 'files';

    protected $fillable = [
        'user_id',
        'name',
        'cloud_path',
        'app_path',
        'type',
        'extension',
        'size',
        'date'
    ];

    public $timestamps = false;
}
