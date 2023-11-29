<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Helpers;
use App\Models\File;
use App\Models\Folder;

class DeleteController extends Controller
{
    public function deleteItems(Request $request)
    {
        $itemIds = $request->validate([
            'itemIds' => 'required|array',
            'itemIds.*.id' => 'required'
        ]);

        try {
            DB::beginTransaction();

            $deletedFolderIds = [];
            $deletedFileIds = [];

            foreach ($itemIds['itemIds'] as $itemId) {
                $id = $itemId['id'];
                $isFolderId = Str::startsWith($id, 'd_');

                if ($isFolderId) {
                    $dbId = Str::after($id, 'd_'); // Remove 'd_' prefix for backend processing
                    $this->deleteFolder($dbId, $deletedFolderIds, $deletedFileIds);
                    $deletedFolderIds[] = 'd_' . $dbId; // Add back 'd_' prefix for the response
                } 
                else {
                    $file = File::find($id);

                    $cloud_path = Helpers::convertAppPath(auth()->id(), $file->app_path, $id);
                    $rcloneCommand = env('RCLONE_EXE_PATH') . " delete " . env('RCLONE_REMOTE') . ":LimeDriveBucket/{$cloud_path} --b2-hard-delete";
                    exec($rcloneCommand); // Use rclone because backblaze hides files instead of deleting them permanently and instantly
                    if (Storage::exists($cloud_path)) {
                        throw new \Exception('Failed to delete file from cloud storage.');
                    }
                    $file->delete();
                    $deletedFileIds[] = $id;
                }
            }

            return response()->json([
                'message' => 'Item(s) deleted successfully',
                'deletedFolderIds' => $deletedFolderIds,
                'deletedFileIds' => $deletedFileIds,
            ]);
        } 
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    private function deleteFolder($folderId, &$deletedFolderIds, &$deletedFileIds)
    {
        $folder = Folder::find($folderId);
        if (!$folder) return;

        $subfiles = File::where('parent_folder_id', $folderId)->get();

        foreach ($subfiles as $subfile) {
            $cloud_path = Helpers::convertAppPath(auth()->id(), $subfile->app_path, $subfile->id);
            $rcloneCommand = env('RCLONE_EXE_PATH') . " delete " . env('RCLONE_REMOTE') . ":LimeDriveBucket/{$cloud_path} --b2-hard-delete";
            exec($rcloneCommand);
            if (Storage::exists($cloud_path)) {
                throw new \Exception('Failed to delete file from cloud storage.');
            }
            $subfile->delete();
            $deletedFileIds[] = $subfile->id;
        }

        $subfolders = Folder::where('parent_folder_id', $folderId)->get();

        foreach ($subfolders as $subfolder) {
            $this->deleteFolder($subfolder->id, $deletedFolderIds, $deletedFileIds);
        }

        $deletedFolderIds[] = 'd_' . $folderId; // Add back 'd_' prefix for the response
        $folder->delete();
    }
}