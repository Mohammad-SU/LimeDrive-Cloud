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

            if (Str::startsWith($file->type, 'text/plain')) {
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
            else {
                $expirationTime = now()->addMinutes(15)->timestamp; // Most supported file types for previews on frontend don't have problems after url is expired (video types do, but the user is informed if the url has expired)
                $fileUrl = Storage::temporaryUrl(
                    $cloudPath,
                    $expirationTime,
                );
                return response()->json(['fileUrl' => $fileUrl, 'expirationTime' => $expirationTime]);
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

            $fileUrl = Storage::temporaryUrl(
                $cloudPath,
                now()->addMinutes(15), // Download still continues even after url is expired
                [
                    'ResponseContentType' => $file->type,
                    'ResponseContentDisposition' => 'attachment; filename="' . $file->name . '"',
                ]
            );
            return response()->json(['fileUrl' => $fileUrl]);
        }
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}