<?php

namespace App\Http;

class Helpers
{
    public static function convertAppPath($user_id, $file_id, $file_extension)
    {
        $cloud_path = $user_id . '/' . (string)$file_id . '.' . $file_extension;
        return $cloud_path;
    }
}
