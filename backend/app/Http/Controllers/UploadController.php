<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;

class UploadController extends Controller
{
    public function uploadFile(Request $request)
    {    
        try {
            $fileData = $request->validate([
                'app_path' => 'required|string',
                'file' => 'required|file',
                'parent_folder_id' => 'nullable|string', // |string here since formData on frontend doesn't allow int
            ]);
            
            $user_id = auth()->id();
            $requestFile = $request->file('file');
            $fileName = $requestFile->getClientOriginalName();
            $extension = $requestFile->getClientOriginalExtension();
            $type = $requestFile->getClientMimeType();
            if ($extension === "odt" && $type === "application/octet-stream") { // For some reason on the frontend JS File object, the type for odt files were empty
                $type = "application/vnd.oasis.opendocument.text";
            }
            $parentFolderId = $request['parent_folder_id'] === null ? 
                null
                : intval($request['parent_folder_id']);

            DB::beginTransaction();

            $uploadedFile = File::create([
                'user_id' => $user_id,
                'parent_folder_id' => $parentFolderId,
                'name' => $fileName,
                'app_path' => $fileData['app_path'],
                'type' => $type,
                'size' => $requestFile->getSize(),
                'date' => now(),
            ]);

            if (!Storage::putFileAs($user_id, $requestFile, $uploadedFile->id . '.' . $extension)) {
                throw new \Exception('Failed to upload file to cloud storage.');
            }
    
            DB::commit();
            return response()->json($uploadedFile);
        } 
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => "Failed to upload file."], 500);
        }
    }

    public function createFolder(Request $request)
    {
        try {
            $folderData = $request->validate([
                'name' => ['required', 'string', 'regex:/^[^<>\\/:?*"|]{1,255}$/'], // Array due to pipe in regex
                'app_path' => 'required|string',
                'parent_folder_id' => 'nullable|integer|numeric',
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
        catch (\Exception $e) {
            return response()->json(['error' => "Failed to create folder."], 500);
        }
    }
}