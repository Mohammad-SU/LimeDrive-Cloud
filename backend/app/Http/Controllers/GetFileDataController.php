<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Helpers;
use App\Models\File;

class GetFileDataController extends Controller
{
    public function getFileContent(Request $request)
    {
        try {
            $fileData = $this->findFileData($request);
            return response()->json(['fileContent' => base64_encode($fileData['content'])]);
        } 
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getFileDownload(Request $request)
    {
        try {
            $fileData = $this->findFileData($request);
            $headers = [
                'Content-Type' => $fileData['file']->type,
                'Content-Disposition' => 'attachment; filename="' . $fileData['file']->name . '"',
            ];
            return response($fileData['content'], 200, $headers);
        } 
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function findFileData(Request $request)
    {
        $fileData = $request->validate(['id' => 'required|int']);
        $file = File::findOrFail($fileData['id']);
        $fileExtension = pathinfo($file->name, PATHINFO_EXTENSION);
        $cloudPath = Helpers::getCloudPath(auth()->id(), $file->id, $fileExtension);
        $content = Storage::disk('s3')->get($cloudPath);
        if ($content === false) {
            throw new \Exception('File not found.');
        }

        return [
            'file' => $file,
            'content' => $content,
        ];
    }
}