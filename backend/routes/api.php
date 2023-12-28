<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UpdateItemsController;
use App\Http\Controllers\GetItemDataController;
use App\Http\Controllers\DeleteItemsController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::group(['middleware' => ['auth:sanctum', 'throttle:60,1']], function () {
    Route::get('/user', [UserController::class, 'getUserData']);
    Route::post('/logout', [UserController::class, 'logout']);
    Route::post('/updateUsername', [UserController::class, 'updateUsername']);
    Route::post('/updateEmail', [UserController::class, 'updateEmail']);
    Route::post('/updatePassword', [UserController::class, 'updatePassword']);
    Route::post('/deleteAccount', [UserController::class, 'deleteAccount']);

    Route::post('/uploadFile', [UploadController::class, 'uploadFile']);
    Route::post('/createFolder', [UploadController::class, 'createFolder']);

    Route::post('/updatePaths', [UpdateItemsController::class, 'updatePaths']);

    Route::get('/getFileContent', [GetItemDataController::class, 'getFileContent']);
    Route::get('/getItemDownload', [GetItemDataController::class, 'getItemDownload'])
        ->middleware('throttle:8,0.2');

    Route::delete('/deleteItems', [DeleteItemsController::class, 'deleteItems']);
});

Route::group(['middleware' => ['throttle:60,1']], function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});