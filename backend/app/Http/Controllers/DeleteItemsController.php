<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Helpers;
use App\Models\File;
use App\Models\Folder;

class DeleteItemsController extends Controller
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
                    $file = File::findOrFail($id);
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

        foreach ($deletedFileData as $deletedFileDataItem) { // Don't put in try catch as I don't have logic for backups/restoring deleted files on the bucket, so if one deletion fails during the loop then previous files will not be restored on the bucket
            $cloudPath = Helpers::getCloudPath(auth()->id(), $deletedFileDataItem['id'], $deletedFileDataItem['extension']);
            Storage::delete($cloudPath);
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

    private function deleteFolder($parentFolderId, &$deletedFolderIds, &$deletedFileData)
    {
        $parentFolder = Folder::findOrFail($parentFolderId);

        foreach ($parentFolder->subfiles as $subfile) {
            $extension = pathinfo($subfile->name, PATHINFO_EXTENSION);
            $id = $subfile->id;
            $subfile->delete();
            $deletedFileData[] = [
                'id' => $id,
                'extension' => $extension,
            ];
        }

        foreach ($parentFolder->subfolders as $subfolder) {
            $this->deleteFolder($subfolder->id, $deletedFolderIds, $deletedFileData);
        }

        $deletedFolderIds[] = 'd_' . $parentFolderId; // Add back 'd_' prefix for the response
        $parentFolder->delete();
    }
}
