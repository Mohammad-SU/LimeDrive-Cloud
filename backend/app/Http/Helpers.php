<?php

namespace App\Http;

class Helpers
{
    public static function convertAppPath($user_id, $app_path)
    {
        return preg_replace('/LimeDrive/', (string)$user_id, $app_path, 1);
    }
}