<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UpdateController;
use App\Http\Controllers\FetchFileContentController;
use App\Http\Controllers\DeleteController;

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

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('/user', [UserController::class, 'getUserData']);
    Route::post('/logout', [UserController::class, 'logout']);

    Route::post('/uploadFile', [UploadController::class, 'uploadFile']);
    Route::post('/createFolder', [UploadController::class, 'createFolder']);

    Route::post('/updatePaths', [UpdateController::class, 'updatePaths']);

    Route::post('/fetchFileContent', [FetchFileContentController::class, 'fetchFileContent']);

    Route::post('/deleteItems', [DeleteController::class, 'deleteItems']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);