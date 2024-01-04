<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function updateUsername(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'newUsername' => 'required|regex:/^[a-zA-Z0-9_-]+$/|unique:users,username|max:30',
            'currentPassword' => 'required|string|min:8|max:72|correct_password|regex:/\S/',
        ], ['newUsername.unique' => 'Username is taken.',]);

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
            'currentPassword' => 'required|string|min:8|max:72|correct_password|regex:/\S/',
        ], ['newEmail.unique' => 'Email is taken.',]);

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
            'currentPassword' => 'required|string|min:8|max:72|correct_password|regex:/\S/',
            'newPassword' => 'required|string|min:8|max:72|different:currentPassword|regex:/\S/',
            'confirmNewPassword' => 'required|string|min:8|max:72|same:newPassword|regex:/\S/',
        ]);
        
        try {
            DB::beginTransaction();
    
            $user->password_hash = bcrypt($request['newPassword']);
            $user->save();
            $user->tokens()->delete(); // Delete all tokens of that user
    
            DB::commit();
            return response()->json(['message' => 'Password updated successfully.']);
        } 
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update password.'], 500);
        }
    }    

    public function deleteAccount(Request $request)
    {
        $user = $request->user();
    
        $request->validate([
            'currentPassword' => 'required|string|min:8|max:72|correct_password|regex:/\S/',
            'isDeleteChecked' => 'required|boolean|accepted',
        ]);
        
        if ($user->deleteAccount()) {
            return response()->json(['message' => 'Account deleted successfully.']);
        } else {
            return response()->json(['error' => 'Failed to delete account.'], 500);
        }
    }
}