<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'emailReg' => 'required|email|unique:users,email',
            'usernameReg' => 'required|regex:/^[a-zA-Z0-9_-]+$/|unique:users,username',
            'passwordReg' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'email' => $validatedData['emailReg'],
            'username' => $validatedData['usernameReg'],
            'password' => bcrypt($validatedData['passwordReg']),
        ]);

        Auth::login($user);

        return response()->json(['message' => 'Registration successful', 'user' => $user]);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('usernameOrEmailLog', 'passwordLog');

        if (Auth::attempt($credentials)) {
            return response()->json(['message' => 'Login successful', 'user' => Auth::user()]);
        }

        return response()->json(['message' => 'Invalid login credentials'], 401);
    }
}