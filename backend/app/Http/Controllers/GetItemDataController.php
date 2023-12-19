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
                $contentStream = Storage::readStream($cloudPath);
                return response()->stream(
                    function () use ($contentStream) {
                        fpassthru($contentStream);
                        fclose($contentStream);
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
            return response()->json(['error' => "Failed to get content or URL."], 500);
        }
    }

    public function getItemDownload(Request $request)
    {
        try {
            $request->validate([
                'itemIds' => 'required|array',
                'itemIds.*' => 'required',
            ]);
            $file = File::findOrFail($request['itemIds'][0]);
            $fileExtension = pathinfo($file->name, PATHINFO_EXTENSION);
            $cloudPath = Helpers::getCloudPath(auth()->id(), $file->id, $fileExtension);
            
            return response()->streamDownload(
                function () use ($cloudPath) {
                    $contentStream = Storage::readStream($cloudPath);
                    fpassthru($contentStream);
                    fclose($contentStream);
                }, 
                $file->name, 
                [
                    'Content-Type' => $file->type,
                    'Content-Disposition' => 'attachment',
                ]
            );
        } 
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}