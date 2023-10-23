<?php

namespace App\Http\Controllers;

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

        $updatedItems = [];

        foreach ($items['items'] as $itemData) {
            $id = $itemData['id'];
            $new_path = $itemData['new_path'];
            $type = isset($itemData['type']) ? $itemData['type'] : null;
            $parent_folder_id = $itemData['parent_folder_id'];

            if ($type === null) {
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

        return response()->json(['message' => 'Items path updated successfully', 'updatedItems' => $updatedItems]);
    }


    private function updateChildPaths($parentFolder, $new_path, &$updatedItems) // Recursive function for updating children items' app_path
    {
        $parent_folder_id = $parentFolder->id;
        
        $files = File::where('parent_folder_id', $parent_folder_id)->get();

        foreach ($files as $file) { // parent_folder_id fields dont need to be changed for child files/folders
            $file->app_path = $new_path . '/' . $file->name;
            $file->save();
            $updatedItems[] = ['id' => $file->id, 'updated_path' => $file->app_path];
        }

        $folders = Folder::where('parent_folder_id', $parent_folder_id)->get();
        
        foreach ($folders as $subfolder) {
            $subfolder->app_path = $new_path . '/' . $subfolder->name;
            $subfolder->save();
            $updatedItems[] = ['id' => 'd_' . $subfolder->id, 'updated_path' => $subfolder->app_path];

            $this->updateChildPaths($subfolder, $subfolder->app_path, $updatedItems);
        }
    }
}