<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UpdateItemsController extends Controller
{
    public function updatePaths(Request $request)
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required',
                'items.*.new_path' => 'required|string',
                'items.*.new_parent_folder_id' => 'nullable|string|different:items.*.id',
            ]);
            $updatedItems = [];

            DB::beginTransaction();

            foreach ($request['items'] as $item) {
                $id = $item['id'];
                $isFolderId = Str::startsWith($id, 'd_');
                $new_path = $item['new_path'];
                $newParentFolderDbId = $item['new_parent_folder_id'] === null ?
                    null
                    : intval(Str::after($item['new_parent_folder_id'], 'd_'));

                if ($isFolderId) {
                    $dbId = intval(Str::after($id, 'd_'));
                    $updItem = Folder::findOrFail($dbId);
                    $this->updateChildPaths($updItem, $new_path, $updatedItems);
                    $updatedItems[] = ['id' => $id, 'updated_path' => $new_path];
                } 
                else {
                    $updItem = File::findOrFail($id);
                    $updatedItems[] = ['id' => $updItem->id, 'updated_path' => $new_path];
                }

                $updItem->app_path = $new_path;
                $updItem->parent_folder_id = $newParentFolderDbId;
                $updItem->save();
            }

            DB::commit();
            return response()->json(['message' => 'Item path(s) updated successfully', 'updatedItems' => $updatedItems]);
        } 
        catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);

            if ($e instanceof QueryException && $e->getCode() === '23000' && $e->errorInfo[1] === 1062) { // If MySQL error for duplicate entry (leave all checks, and getCode() does return the code as a string)
                $matches = [];
                preg_match("/update `([^']+)` set `app_path` = .*? where `id` = (\d+)/", $e->getMessage(), $matches);

                if (count($matches) === 3) {
                    return response()->json([
                        'error' => 'Disallowed duplicate name and parent_folder_id detected.', 
                        'table' => $matches[1], 
                        'id' => $matches[2]
                    ], 422);
                }
            }

            return response()->json(['error' => "Failed to update path(s)."], 500);
        }
    }
    private function updateChildPaths($parentFolder, $new_path, &$updatedItems) // Recursive function for updating children items' app_path
    {
        foreach ($parentFolder->subfiles as $subfile) { // parent_folder_id fields dont need to be changed for subfiles/subfolders
            $subfile->app_path = $new_path . '/' . $subfile->name;
            $subfile->save();
            $updatedItems[] = ['id' => $subfile->id, 'updated_path' => $subfile->app_path];
        }
        
        foreach ($parentFolder->subfolders as $subfolder) {
            $subfolder->app_path = $new_path . '/' . $subfolder->name;
            $subfolder->save();
            $updatedItems[] = ['id' => 'd_' . $subfolder->id, 'updated_path' => $subfolder->app_path];

            $this->updateChildPaths($subfolder, $subfolder->app_path, $updatedItems);
        }
    }
}