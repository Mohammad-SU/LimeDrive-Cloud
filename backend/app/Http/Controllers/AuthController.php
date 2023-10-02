<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    private function createLoginResponse(Request $request, User $user, $message)
    {
        $additionalDetails = [
            'username' => $user->username,
            'email' => $user->email,
        ];

        if (!$request->input('skipTokenCreation')) {
            $token = $user->createToken('auth_token')->plainTextToken;
        } 
        else {
            $token = null;
        };

        $response = response()->json([
            'message' => $message,
            'user' => $additionalDetails,
            'token' => $token,
        ]);

        return $response;
    }

    public function register(Request $request)
    {
        $rules = [
            'usernameReg' => 'required|regex:/^[a-zA-Z0-9_-]+$/|unique:users,username|max:30',
            'passwordReg' => 'required|string|min:8|max:72',
        ];
    
        if ($request->has('emailReg')) { // If the request has an email field, also require password confirmation
            $rules['emailReg'] = 'required|email|unique:users,email|max:255';
            $rules['passwordReg'] .= '|confirmed';
        }
    
        $validatedData = $request->validate($rules, [
            'emailReg.unique' => 'Email is taken.',
            'usernameReg.unique' => 'Username is taken.',
        ]);
    
        $user = User::create([
            'email' => $validatedData['emailReg'] ?? null, // Set as null if not provided (i.e. when account generator is used)
            'username' => $validatedData['usernameReg'],
            'password_hash' => bcrypt($validatedData['passwordReg']),
        ]);
    
        Auth::login($user);

        $message = 'Registration successful.';
        return $this->createLoginResponse($request, $user, $message);
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

            $message = 'Login successful.';
            return $this->createLoginResponse($request, $user, $message);
        } 
        else {
            return response()->json(['message' => 'Invalid login details.'], 400);
        };
    }
}