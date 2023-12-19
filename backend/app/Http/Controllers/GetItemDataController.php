<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Helpers;
use App\Models\File;

class GetItemDataController extends Controller
{
    public function getFileContent(Request $request)
    {
        try {
            $request->validate(['id' => 'required|int']);
            $file = File::findOrFail($request['id']);
            $fileExtension = pathinfo($file->name, PATHINFO_EXTENSION);
            $cloudPath = Helpers::getCloudPath(auth()->id(), $file->id, $fileExtension);
            $expirationTime = now()->addMinutes(15)->timestamp;

            if (Str::startsWith($file->type, 'video/')) {
                $fileUrl = Storage::temporaryUrl(
                    $cloudPath,
                    $expirationTime,
                );
    
                return response()->json(['fileUrl' => $fileUrl, 'expirationTime' => $expirationTime]);
            } 
            else {
                $content = Storage::readStream($cloudPath);
                return response()->stream(
                    function () use ($content) {
                        fpassthru($content);
                    },
                    200,
                    [
                        'Content-Type' => $file->type,
                        'Content-Disposition' => 'inline; filename="' . $file->name . '"',
                    ]
                );
            }
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