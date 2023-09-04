<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function upload(Request $request)
    {
        $uploadedFiles = [];
        $app_path = $request->input('app_path');
        $user_id = (int)$request->input('user_id');
        $app_path_replaced = str_replace('all-files', (string)$user_id, $app_path);

        foreach ($request->file('files') as $uploadedFile) {
            $content_path = $app_path_replaced . $uploadedFile->getClientOriginalName();
            $content = file_get_contents($uploadedFile->getRealPath());
            Storage::disk('s3')->put($content_path, $content);

            $uploadedFiles[] = File::create([
                'user_id' => $user_id,
                'name' => $uploadedFile->getClientOriginalName(),
                'content_path' => $content_path,
                'app_path' => $app_path,
                'type' => $uploadedFile->getClientMimeType(),
                'extension' => $uploadedFile->getClientOriginalExtension(),
                'size' => $uploadedFile->getSize(),
                'date' => now(),
            ]);
        }

        return response()->json($uploadedFiles);
    }

    public function index()
    {
        return File::all();
    }
}