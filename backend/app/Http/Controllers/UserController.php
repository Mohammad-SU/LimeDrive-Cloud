<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Folder;

class UserController extends Controller
{
    public function getUserData(Request $request)
    {
        $user = $request->user();
        $files = File::where('user_id', $user->id)->get();
        $folders = Folder::where('user_id', $user->id)->get();

        return response()->json([
            'user' => [
                'username' => $user->username,
                'email' => $user->email,
            ],
            'files' => $files,
            'folders' => $folders,
        ]);
    }
    
    public function logout(Request $request)
    {

        $request->user()->currentAccessToken()->delete();
    
        return response()->json(['message' => 'Logged out successfully.']);
    }
}