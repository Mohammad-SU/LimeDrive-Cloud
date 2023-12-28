<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

    private function checkCurrentPassword($user, $request)
    {
        if (!Hash::check($request->input('currentPassword'), $user->password_hash)) {
            return response()->json(['message' => 'Invalid current password.'], 400);
        }
    }

    public function updateUsername(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'newUsername' => 'required|regex:/^[a-zA-Z0-9_-]+$/|unique:users,username|max:30',
            'currentPassword' => 'required|string|min:8|max:72',
        ], ['newUsername.unique' => 'Username is taken.',]);
        $this->checkCurrentPassword($user, $request);

        $user->username = $request['newUsername'];
        $user->save();

        return response()->json([
            'message' => 'Username updated successfully.',
            'newUsername' => $request['newUsername'],
        ]);
    }

    public function updateEmail(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'newEmail' => 'required|email|unique:users,email|max:255',
            'currentPassword' => 'required|string|min:8|max:72',
        ], ['newEmail.unique' => 'Email is taken.',]);
        $this->checkCurrentPassword($user, $request);

        $user->email = $request['newEmail'];
        $user->save();

        return response()->json([
            'message' => 'Email updated successfully.',
            'newEmail' => $request['newEmail'],
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
    
        $request->validate([
            'currentPassword' => 'required|string|min:8|max:72',
            'newPassword' => 'required|string|min:8|max:72',
            'confirmNewPassword' => 'required|string|min:8|max:72|same:newPassword',
        ]);
        $this->checkCurrentPassword($user, $request);
        
        $user->password_hash = bcrypt($request['newPassword']);
        $user->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }    

    public function deleteAccount(Request $request)
    {
        
    }
}