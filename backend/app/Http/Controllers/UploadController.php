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
        $fileData = $request->validate([
            'app_path' => 'required|string',
            'file' => 'required|file',
        ]);
        $user_id = auth()->id();
        $requestFile = $request->file('file');
        $extension = $requestFile->getClientOriginalExtension();
        $fileName = $requestFile->getClientOriginalName();
    
        try {
            DB::beginTransaction();

            $uploadedFile = File::create([
                'user_id' => $user_id,
                'parent_folder_id' => intval($request->input('parent_folder_id')),
                'name' => $fileName,
                'app_path' => $fileData['app_path'],
                'type' => $requestFile->getClientMimeType(),
                'extension' => $extension,
                'size' => $requestFile->getSize(),
                'date' => now(),
            ]);

            if (!Storage::putFileAs($user_id, $requestFile, $uploadedFile->id . '.' . $extension)) { // for b2 bucket
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
        $folderData = $request->validate([
            'name' => ['required', 'string', 'regex:/^[^<>\\/:?*"|]{1,255}$/'], // Array due to pipe in regex
            'app_path' => 'required|string',
            'parent_folder_id' => 'required|integer|numeric',
        ]);
        $user_id = $request->user()->id;

        $uploadedFolder = Folder::create([
            'user_id' => $user_id,
            'parent_folder_id' => $folderData['parent_folder_id'],
            'name' => $folderData['name'],
            'app_path' => $folderData['app_path'],
            'date' => now(),
        ]);

        return response()->json($uploadedFolder);
    }
}