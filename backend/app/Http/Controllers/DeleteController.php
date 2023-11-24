<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;
use Illuminate\Support\Str;

class DeleteController extends Controller
{
    public function deleteItems(Request $request)
    {
        $itemIds = $request->validate([
            'itemIds' => 'required|array',
            'itemIds.*.id' => 'required'
        ]);

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
                if ($file) {
                    $file->delete();
                    $deletedFileIds[] = $id;
                }
            }
        }

        return response()->json([
            'message' => 'Item(s) deleted successfully',
            'deletedFolderIds' => $deletedFolderIds,
            'deletedFileIds' => $deletedFileIds,
        ]);
    }

    private function deleteFolder($folderId, &$deletedFolderIds, &$deletedFileIds)
    {
        $folder = Folder::find($folderId);

        if ($folder) {
            $subfiles = File::where('parent_folder_id', $folderId)->get();

            foreach ($subfiles as $subfile) {
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
}