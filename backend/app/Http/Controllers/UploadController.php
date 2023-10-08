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
        $cloud_path = str_replace('all-files', (string)$user_id, $app_path); // "all-files/" ==> "<user_id>/" in B2 bucket

        $requestFile = $request->file('file');
    
        $content = file_get_contents($requestFile->getRealPath());
    
        $uploadedFile = File::create([
            'user_id' => $user_id,
            'name' => $requestFile->getClientOriginalName(),
            'cloud_path' => $cloud_path,
            'app_path' => $app_path,
            'type' => $requestFile->getClientMimeType(),
            'extension' => $requestFile->getClientOriginalExtension(),
            'size' => $requestFile->getSize(),
            'date' => now(),
        ]);
    
        Storage::disk('s3')->put($cloud_path, $content);
    
        return response()->json($uploadedFile);
    }    

    public function uploadFolder(Request $request)
    {
        $user_id = $request->user()->id;
        $app_path = $request->input('app_path');
        $cloud_path = str_replace('all-files', (string)$user_id, $app_path); // "all-files/" ==> "<user_id>/" in B2 bucket
    
        $uploadedFolder = Folder::create([
            'user_id' => $user_id,
            'name' => $request->input('name'),
            'cloud_path' => $cloud_path,
            'app_path' => $app_path,
            'date' => now(),
        ]);

        Storage::disk('s3')->put($cloud_path . '/.keep', ''); // .keep indicates that the folder is intentionally technically empty or keeps the folder if there are no other files in it (in the b2 bucket, folders are deleted if their only item is removed)
    
        return response()->json($uploadedFolder);
    }
}