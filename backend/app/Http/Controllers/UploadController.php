<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function uploadFiles(Request $request)
    {
        $uploadedFiles = [];
        $app_path = $request->input('app_path');
        $user_id = $request->user()->id;
        $app_path_replaced = str_replace('all-files', (string)$user_id, $app_path);

        foreach ($request->file('files') as $uploadedFile) {
            $name = $uploadedFile->getClientOriginalName();
            $cloud_path = $app_path_replaced . $name;
            $content = file_get_contents($uploadedFile->getRealPath());
            Storage::disk('s3')->put($cloud_path, $content);

            $uploadedFiles[] = File::create([
                'user_id' => $user_id,
                'name' => $name,
                'cloud_path' => $cloud_path,
                'app_path' => $app_path,
                'type' => $uploadedFile->getClientMimeType(),
                'extension' => $uploadedFile->getClientOriginalExtension(),
                'size' => $uploadedFile->getSize(),
                'date' => now(),
            ]);
        }

        return response()->json($uploadedFiles);
    }

    public function uploadFolder(Request $request)
    {
        $uploadedFolders = [];
        $app_path = $request->input('app_path');
        $user_id = $request->user()->id;
    
        foreach ($request->file('folders') as $uploadedFolder) {
            $uploadedFolders[] = Folder::create([
                'user_id' => $user_id,
                'name' => $uploadedFolder->getClientOriginalName(),
                'app_path' => $app_path,
                'date' => now(),
            ]);
        }
    
        return response()->json($uploadedFolders);
    }    
}