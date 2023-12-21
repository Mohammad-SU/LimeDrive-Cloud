<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    use HasFactory;

    protected $table = 'folders';

    protected $fillable = [
        'user_id',
        'parent_folder_id',
        'name',
        'app_path', 
        'date'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subfiles()
    {
        return $this->hasMany(File::class, 'parent_folder_id', 'id');
    }

    public function subfolders()
    {
        return $this->hasMany(Folder::class, 'parent_folder_id', 'id');
    }

    public function subitems()
    {
        $files = $this->hasMany(File::class, 'parent_folder_id', 'id');
        $folders = $this->hasMany(Folder::class, 'parent_folder_id', 'id');
    
        return $files->union($folders);
    }
}
