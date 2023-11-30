<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Http\Helpers;
use App\Models\File;
use App\Models\Folder;

class UploadController extends Controller
{
    public function uploadFile(Request $request)
    {
        $user_id = auth()->id();
        $app_path = $request->input('app_path');
        $requestFile = $request->file('file');
        $content = file_get_contents($requestFile->getRealPath());
    
        if (!$requestFile || !$app_path) {
            return response()->json(['message' => 'Missing data.'], 400);
        }
    
        try {
            DB::beginTransaction();   

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

            $cloud_path = Helpers::convertAppPath($user_id, $uploadedFile->id, $requestFile->getClientOriginalExtension());
            if (!Storage::put($cloud_path, $content)) { // for b2 bucket, e.g. LimeDrive/My folder/image.png ==> <user_id>/My folder/<file_id>
                throw new \Exception('Failed to upload file to cloud storage.');
            }
    
            DB::commit();
            return response()->json($uploadedFile);
        } 
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function createFolder(Request $request)
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