<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;
use App\Http\Helpers;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function uploadFile(Request $request)
    {
        $user_id = $request->user()->id;
        $app_path = $request->input('app_path');
        $cloud_path = Helpers::convertAppPath($user_id, $app_path); // change first instance of "LimeDrive" to "<user_id>" for B2 bucket
        $requestFile = $request->file('file');
        $content = file_get_contents($requestFile->getRealPath());
    
        if (!$requestFile || !$app_path) {
            return response()->json(['message' => 'Missing data.'], 400);
        }
        else if (!Storage::put($cloud_path, $content)) {
            return response()->json(['message' => 'Failed to upload file to cloud storage.'], 500);
        }
    
        $uploadedFile = File::create([
            'user_id' => $user_id,
            'parent_folder_id' => intval($request->input('parent_folder_id')),
            'name' => $requestFile->getClientOriginalName(),
            'app_path' => $app_path,
            'type' => $requestFile->getClientMimeType(),
            'extension' => $requestFile->getClientOriginalExtension(),
            'size' => $requestFile->getSize(),
            'date' => now(),
        ]);
    
        return response()->json($uploadedFile);
    }    

    public function uploadFolder(Request $request)
    {
        $user_id = $request->user()->id;
        $name = $request->input('name');
        $app_path = $request->input('app_path');

        if (!preg_match('/^[^<>\\/:?*"|]{1,255}$/', $name) || !$app_path) {
            return response()->json(['message' => 'Invalid folder name format or no app_path provided.'], 400);
        }

        $uploadedFolder = Folder::create([
            'user_id' => $user_id,
            'parent_folder_id' => intval($request->input('parent_folder_id')),
            'name' => $name,
            'app_path' => $app_path,
            'date' => now(),
        ]);

        return response()->json($uploadedFolder);
    }
}