<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function uploadFile(Request $request)
    {
        $user_id = $request->user()->id;
        $app_path = $request->input('app_path');

        $requestFile = $request->file('file');
    
        $content = file_get_contents($requestFile->getRealPath());
    
        $uploadedFile = File::create([
            'user_id' => $user_id,
            'name' => $requestFile->getClientOriginalName(),
            'app_path' => $app_path,
            'type' => $requestFile->getClientMimeType(),
            'extension' => $requestFile->getClientOriginalExtension(),
            'size' => $requestFile->getSize(),
            'date' => now(),
        ]);
    
        $cloud_path = preg_replace('/LimeDrive/', (string)$user_id, $app_path, 1); // change first instance of "LimeDrive" to "<user_id>" for B2 bucket
        Storage::disk('s3')->put($cloud_path, $content);
    
        return response()->json($uploadedFile);
    }    

    public function uploadFolder(Request $request)
    {
        $user_id = $request->user()->id;
        $name = $request->input('name');
        $app_path = $request->input('app_path');

        if (!preg_match('/^[a-zA-Z0-9\s_\-]+$/', $name)) {
            return response()->json(['message' => 'Invalid folder name format.'], 400);
        }

        $uploadedFolder = Folder::create([
            'user_id' => $user_id,
            'name' => $name,
            'app_path' => $app_path,
            'date' => now(),
        ]);

        $cloud_path = preg_replace('/LimeDrive/', (string)$user_id, $app_path, 1); // change first instance of "LimeDrive" to "<user_id>" for B2 bucket
        Storage::disk('s3')->put($cloud_path . '/.keep', ''); // .keep indicates that the folder is intentionally technically empty or keeps the folder if there are no other files in it (in the b2 bucket, folders are deleted if their only item is removed)
    
        return response()->json($uploadedFolder);
    }
}