<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\File;
use App\Models\Folder;

class UpdateController extends Controller
{
    public function updatePaths(Request $request)
    {
        $id = $request->input('id');
        $new_path = $request->input('new_path');
        $type = $request->input('type');

        $validator = Validator::make($request->all(), [
            'id' => 'int',
            'new_path' => 'string',
            'type' => 'nullable',
            'parent_folder_id' => 'int',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 400);
        }

        $updatedItems = [];

        if ($type === null) {
            $item = Folder::find($id);
            $this->updateChildPaths($item, $new_path, $updatedItems);
            $updatedItems[] = ['id' => 'd_' . $item->id, 'updated_path' => $new_path]; // d_ prefix for frontend folders
        }
        else {
            $item = File::find($id);
            $updatedItems[] = ['id' => $item->id, 'updated_path' => $new_path];
        }
        $item->app_path = $new_path;
        $item->parent_folder_id = $request->input('parent_folder_id');
        $item->save();

        return response()->json(['message' => 'Item path updated successfully', 'updatedItems' => $updatedItems]);
    }

    private function updateChildPaths($parentFolder, $new_path, &$updatedItems) // Recursive function for updating children items' app_path
    {
        $parentFolderId = $parentFolder->id;
        
        $files = File::where('parent_folder_id', $parentFolderId)->get();

        foreach ($files as $file) { // parent_folder_id fields dont need to be changed for child files/folders
            $file->app_path = $new_path . '/' . $file->name;
            $file->save();
            $updatedItems[] = ['id' => $file->id, 'updated_path' => $file->app_path];
        }

        $folders = Folder::where('parent_folder_id', $parentFolderId)->get();
        
        foreach ($folders as $subfolder) {
            $subfolder->app_path = $new_path . '/' . $subfolder->name;
            $subfolder->save();
            $updatedItems[] = ['id' => 'd_' . $subfolder->id, 'updated_path' => $subfolder->app_path];

            $this->updateChildPaths($subfolder, $subfolder->app_path, $updatedItems);
        }
    }
}