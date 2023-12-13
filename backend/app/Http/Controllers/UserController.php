<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getUserData(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user' => [
                'username' => $user->username,
                'email' => $user->email,
            ],
            'files' => $user->files,
            'folders' => $user->folders,
        ]);
    }
    
    public function logout(Request $request)
    {

        $request->user()->currentAccessToken()->delete();
    
        return response()->json(['message' => 'Token deleted successfully.']);
    }
}