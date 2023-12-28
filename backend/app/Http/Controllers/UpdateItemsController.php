<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;

class UpdateItemsController extends Controller
{
    public function updatePaths(Request $request)
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|int',
                'items.*.new_path' => 'required|string',
                'items.*.type' => 'nullable',
                'items.*.parent_folder_id' => 'required|int',
            ]);
            $updatedItems = [];

            DB::beginTransaction();

            foreach ($request['items'] as $item) {
                $id = $item['id'];
                $new_path = $item['new_path'];
                $parent_folder_id = $item['parent_folder_id'];

                if (!isset($item['type'])) {
                    $updItem = Folder::findOrFail($id);
                    $this->updateChildPaths($updItem, $new_path, $updatedItems);
                    $updatedItems[] = ['id' => 'd_' . $updItem->id, 'updated_path' => $new_path];
                } 
                else {
                    $updItem = File::findOrFail($id);
                    $updatedItems[] = ['id' => $updItem->id, 'updated_path' => $new_path];
                }

                $updItem->app_path = $new_path;
                $updItem->parent_folder_id = $parent_folder_id;
                $updItem->save();
            }

            DB::commit();
            return response()->json(['message' => 'Item path(s) updated successfully', 'updatedItems' => $updatedItems]);
        }
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => "Failed to update path(s)."], 500);
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