<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'emailReg' => 'required|email|unique:users,email',
            'usernameReg' => 'required|regex:/^[a-zA-Z0-9_-]+$/|unique:users,username',
            'passwordReg' => 'required|string|min:8|confirmed',
        ], [
            'emailReg.unique' => 'The email has already been taken.',
            'usernameReg.unique' => 'The username has already been taken.',
        ]);

        $user = User::create([
            'email' => $validatedData['emailReg'],
            'username' => $validatedData['usernameReg'],
            'password_hash' => bcrypt($validatedData['passwordReg']),
        ]);

        Auth::login($user);

        return response()->json(['message' => 'Registration successful', 'user' => $user]);
    }
    
    public function login(Request $request)
    {
        $credentials = $request->only('usernameOrEmailLog', 'passwordLog');
    
        $isEmail = filter_var($credentials['usernameOrEmailLog'], FILTER_VALIDATE_EMAIL);
    
        $field = $isEmail ? 'email' : 'username';
    
        $newCredentials = [
            $field => $credentials['usernameOrEmailLog'],
        ];
    
        $user = User::where($field, $newCredentials[$field])->first();
    
        if ($user && Hash::check($credentials['passwordLog'], $user->password_hash)) {
            Auth::login($user);
            return response()->json(['message' => 'Login successful', 'user' => Auth::user()]);
        } else {
            return response()->json(['message' => 'Invalid login credentials'], 401);
        }
    }
}