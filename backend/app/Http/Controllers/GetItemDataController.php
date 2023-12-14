<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Helpers;
use App\Models\File;

class GetItemDataController extends Controller
{
    public function getFileContent(Request $request)
    {
        $request->validate(['id' => 'required|int']);

        try {
            $file = File::findOrFail($request['id']);
            $fileExtension = pathinfo($file->name, PATHINFO_EXTENSION);
            $cloudPath = Helpers::getCloudPath(auth()->id(), $file->id, $fileExtension);
            $content = Storage::disk('s3')->get($cloudPath);
            
            return response()->json(['fileContent' => base64_encode($content)]);
        } 
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getItemDownload(Request $request)
    {
        // $request->validate([
        //     'items' => 'required|array',
        //     'items.id' => 'required',
        // ]);

        // try {
        //     $fileData = $this->findFileData($request);
        //     $headers = [
        //         'Content-Type' => $fileData['file']->type,
        //         'Content-Disposition' => 'attachment; filename="' . $fileData['file']->name . '"',
        //     ];
        //     return response($fileData['content'], 200, $headers);
        // } 
        // catch (\Exception $e) {
        //     return response()->json(['error' => $e->getMessage()], 500);
        // }
    }
}