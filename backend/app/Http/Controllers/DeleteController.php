<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Jobs\RcloneDeleteJob;
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

        $deletedFolderIds = [];
        $deletedFileData  = [];

        try {
            DB::beginTransaction();
            foreach ($itemIds['itemIds'] as $itemId) {
                $id = $itemId['id'];
                $isFolderId = Str::startsWith($id, 'd_');

                if ($isFolderId) {
                    $dbId = Str::after($id, 'd_'); // Remove 'd_' prefix for backend processing
                    $this->deleteFolder($dbId, $deletedFolderIds, $deletedFileData);
                    $deletedFolderIds[] = 'd_' . $dbId; // Add back 'd_' prefix for the response
                } 
                else {
                    $file = File::find($id);
                    $extension = pathinfo($file->name, PATHINFO_EXTENSION);
                    $file->delete();
                    $deletedFileData[] = [
                        'id' => $id,
                        'extension' => $extension,
                    ];
                }
            }
            DB::commit();
        }
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => "Failed to delete."], 500);
        }

        foreach ($deletedFileData as $deletedFileDataItem) {
            $cloudPath = Helpers::getCloudPath(auth()->id(), $deletedFileDataItem['id'], $deletedFileDataItem['extension']);
            RcloneDeleteJob::dispatch($cloudPath); // Use rclone because backblaze hides files for at least a day instead of deleting them permanently and instantly, and put in job queue since it seems to be slow
        }

        $deletedFileIds = array_map(function ($file) {
            return $file['id'];
        }, $deletedFileData);

        return response()->json([
            'message' => 'Item(s) deleted successfully',
            'deletedFolderIds' => $deletedFolderIds,
            'deletedFileIds' => $deletedFileIds,
        ]);
    }

    private function deleteFolder($folderId, &$deletedFolderIds, &$deletedFileData)
    {
        $folder = Folder::find($folderId);
        if (!$folder) return;

        $subfiles = File::where('parent_folder_id', $folderId)->get();
        foreach ($subfiles as $subfile) {
            $extension = pathinfo($subfile->name, PATHINFO_EXTENSION);
            $id = $subfile->id;
            $subfile->delete();
            $deletedFileData[] = [
                'id' => $id,
                'extension' => $extension,
            ];
        }

        $subfolders = Folder::where('parent_folder_id', $folderId)->get();
        foreach ($subfolders as $subfolder) {
            $this->deleteFolder($subfolder->id, $deletedFolderIds, $deletedFileData);
        }

        $deletedFolderIds[] = 'd_' . $folderId; // Add back 'd_' prefix for the response
        $folder->delete();
    }
}
