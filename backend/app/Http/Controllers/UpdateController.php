<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;

class UpdateController extends Controller
{
    public function updatePaths(Request $request)
    {
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|int',
            'items.*.new_path' => 'required|string',
            'items.*.type' => 'nullable',
            'items.*.parent_folder_id' => 'required|int',
        ]);

        try {
            DB::beginTransaction();

            $updatedItems = [];

            foreach ($items['items'] as $item) {
                $id = $item['id'];
                $new_path = $item['new_path'];
                $parent_folder_id = $item['parent_folder_id'];

                if (!isset($item['type'])) {
                    $updItem = Folder::find($id);
                    $this->updateChildPaths($updItem, $new_path, $updatedItems);
                    $updatedItems[] = ['id' => 'd_' . $updItem->id, 'updated_path' => $new_path];
                } 
                else {
                    $updItem = File::find($id);
                    $updatedItems[] = ['id' => $updItem->id, 'updated_path' => $new_path];
                }

                $updItem->app_path = $new_path;
                $updItem->parent_folder_id = $parent_folder_id;
                $updItem->save();
            }

            return response()->json(['message' => 'Item path(s) updated successfully', 'updatedItems' => $updatedItems]);
        }
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    private function updateChildPaths($parentFolder, $new_path, &$updatedItems) // Recursive function for updating children items' app_path
    {
        $parent_folder_id = $parentFolder->id;
        
        $subfiles = File::where('parent_folder_id', $parent_folder_id)->get();

        foreach ($subfiles as $subfile) { // parent_folder_id fields dont need to be changed for child files/folders
            $subfile->app_path = $new_path . '/' . $subfile->name;
            $subfile->save();
            $updatedItems[] = ['id' => $subfile->id, 'updated_path' => $subfile->app_path];
        }

        $subfolders = Folder::where('parent_folder_id', $parent_folder_id)->get();
        
        foreach ($subfolders as $subfolder) {
            $subfolder->app_path = $new_path . '/' . $subfolder->name;
            $subfolder->save();
            $updatedItems[] = ['id' => 'd_' . $subfolder->id, 'updated_path' => $subfolder->app_path];

            $this->updateChildPaths($subfolder, $subfolder->app_path, $updatedItems);
        }
    }
}