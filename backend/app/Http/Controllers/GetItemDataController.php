<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Helpers;
use App\Models\File;
use App\Models\Folder;
use ZipArchive;

class GetItemDataController extends Controller
{
    public function getFileContent(Request $request)
    {
        try {
            $request->validate(['id' => 'required|int']);
            $file = File::findOrFail($request['id']);
            $fileExtension = pathinfo($file->name, PATHINFO_EXTENSION);
            $cloudPath = Helpers::getCloudPath(auth()->id(), $file->id, $fileExtension);

            if (Str::startsWith($file->type, 'text/plain')) { // Return text content directly for text/plain files instead of using fetch API with presigned url on the frontend
                $stream = Storage::readStream($cloudPath);
                return response()->stream(
                    function () use ($stream) {
                        fpassthru($stream);
                        fclose($stream);
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
            $request->validate([ // Note that these are the directly selected items' ids (any ids of subfiles/subfolders deeper in the tree are not included here)
                'itemIds' => 'required|array',
                'itemIds.*' => 'required',
            ]);
            $itemIds = $request['itemIds'];
            
            if (count($itemIds) === 1 && !Str::startsWith($itemIds[0], 'd_')) { // If user only wants to download one file
                $file = File::findOrFail($itemIds[0]);
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
                return response()->json(['downloadUrl' => $fileUrl]);
            }

            $parentFolderIds = [];
            $items = [];

            foreach ($itemIds as $itemId) {
                $item = Str::startsWith($itemId, 'd_') ? Folder::findOrFail(substr($itemId, 2)) : File::findOrFail($itemId);
                $items[] = $item;
                $parentFolderIds[] = $item->parent_folder_id;
            }

            if (count(array_unique($parentFolderIds)) > 1) { // Check if all items have the same parent_folder_id
                throw new \Exception('All selected items are not in the same folder.');
            }

            $zipFileName = 
                $parentFolderIds[0] === 0 ? "LimeDrive.zip" // If all these items are in the root
                : (count($items) === 1 ? $items[0]->name // If user wants to download single folder, then zipFileName should also be that folder's name
                : (Folder::where('parent_folder_id', $parentFolderIds[0])->firstOrFail()->name)); // Otherwise it should be the parent folder's name of the multiple selected items

            return response()->streamDownload(
                function () use ($items) {
                    $zip = new ZipArchive;
                    $zipFileName = tempnam(sys_get_temp_dir(), 'LimeDrive');
                    $zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE);

                    foreach ($items as $item) {
                        if ($item instanceof File) {
                            $cloudPath = Helpers::getCloudPath(auth()->id(), $item->id, pathinfo($item->name, PATHINFO_EXTENSION));
                            $zip->addFromString($item->name, Storage::get($cloudPath));
                        } 
                        elseif ($item instanceof Folder) {
                            $this->addFolderToZip($zip, $item, $item->name);
                        }
                    }
        
                    $zip->close();
                    readfile($zipFileName);
                    unlink($zipFileName);
                },
                $zipFileName
            );
        }
        catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    private function addFolderToZip(ZipArchive $zip, Folder $parentFolder, $currentPath)
    {
        if (count($parentFolder->subfiles) === 0 && count($parentFolder->subfolders) === 0) { // If folder is empty then just add the folder
            $zip->addEmptyDir($currentPath);
            return;
        }

        foreach ($parentFolder->subfiles as $subfile) {
            $cloudPath = Helpers::getCloudPath(auth()->id(), $subfile->id, pathinfo($subfile->name, PATHINFO_EXTENSION));
            $zip->addFromString($currentPath.'/'.$subfile->name, Storage::get($cloudPath));
        }

        foreach ($parentFolder->subfolders as $subfolder) {
            $this->addFolderToZip($zip, $subfolder, $currentPath.'/'.$subfolder->name);
        }
    }
}