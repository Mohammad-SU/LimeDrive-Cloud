<?php

namespace App\Http;

class Helpers
{
    public static function convertAppPath($user_id, $app_path, $file_id)
    {
        $pathReplacedRoot = preg_replace('/LimeDrive/', (string)$user_id, $app_path, 1); // Replace "LimeDrive" with user_id

        $file_extension = pathinfo($pathReplacedRoot, PATHINFO_EXTENSION);
        $directory = pathinfo($pathReplacedRoot, PATHINFO_DIRNAME);

        $cloud_path = $directory . '/' . (string)$file_id . '.' . $file_extension;

        return $cloud_path;
    }
}
