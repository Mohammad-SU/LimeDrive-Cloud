<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Helpers;

class FetchFileContentController extends Controller
{
    public function fetchFileContent(Request $request)
    {
        $fileData = $request->validate([
            'id' => 'required|int',
            'extension' => 'nullable|string'
        ]);

        $cloudPath = Helpers::getCloudPath(auth()->id(), $fileData['id'], $fileData['extension']);

        try {
            $fileContent = Storage::disk('s3')->get($cloudPath);
            return response()->json(['fileContent' => base64_encode($fileContent)]);
        } 
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}