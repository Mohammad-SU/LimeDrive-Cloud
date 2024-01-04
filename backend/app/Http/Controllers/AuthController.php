<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationConfirmation;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $rules = [
            'usernameReg' => 'required|regex:/^[a-zA-Z0-9_-]+$/|unique:users,username|max:30',
            'passwordReg' => 'required|string|min:8|max:72|regex:/\S/',
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
        
        // Mail::to($user->email)->send(new RegistrationConfirmation());

        return $this->createLoginResponse($request, $user, 'Registration successful.');
    }
    
    public function login(Request $request)
    {       
        $credentials = $request->only('usernameOrEmailLog', 'passwordLog');

        if (empty(trim($credentials['usernameOrEmailLog'])) || strlen($credentials['passwordLog']) < 8) { // Don't use validator instead (for simpler approach for invalid login details message).
            return response()->json(['error' => 'Invalid login details.'], 400);
        }

        $isEmail = filter_var($credentials['usernameOrEmailLog'], FILTER_VALIDATE_EMAIL);

        $fieldName = $isEmail ? 'email' : 'username'; // User can input username OR email for login
        $fieldValue = $credentials['usernameOrEmailLog'];

        $user = User::where($fieldName, $fieldValue)->first(); // Don't use firstOrFail

        if ($user && Hash::check($credentials['passwordLog'], $user->password_hash)) {
            Auth::login($user);
            return $this->createLoginResponse($request, $user, 'Login successful.');
        } else {
            return response()->json(['error' => 'Invalid login details.'], 400);
        };
    }

    private function createLoginResponse(Request $request, User $user, $message)
    {
        $additionalDetails = [
            'username' => $user->username,
            'email' => $user->email,
        ];

        if (!$request->input('skipTokenCreation')) {
            $token = $user->createToken('auth_token')->plainTextToken;
        } else {
            $token = null;
        };

        $response = response()->json([
            'message' => $message,
            'user' => $additionalDetails,
            'token' => $token,
        ]);

        return $response;
    }
}