<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;

class UpdateController extends Controller
{
    public function updatePaths(Request $request)
    {
        $id = $request->input('id');
        $new_path = $request->input('new_path');
        $type = $request->input('type');

        if ($type === null) {
            $folder = Folder::find($id);
            $folder->app_path = $new_path;
            $folder->save();
        } 
        else {
            $file = File::find($id);
            $file->app_path = $new_path;
            $file->save();
        }

        return response()->json(['message' => 'Item path updated successfully']);
    }
}