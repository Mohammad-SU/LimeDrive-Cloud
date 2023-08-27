<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getUser(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'username' => $user->username,
            'email' => $user->email,
        ]);
    }
    
    public function logout(Request $request)
    {

        $request->user()->tokens()->delete();
    
        return response()->json(['message' => 'Logged out successfully.']);
    }
}