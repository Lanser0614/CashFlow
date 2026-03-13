<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\StreamController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Game saves
    Route::get('/games', [GameController::class, 'index']);
    Route::post('/games', [GameController::class, 'store']);
    Route::get('/games/{id}', [GameController::class, 'show']);
    Route::put('/games/{id}', [GameController::class, 'update']);
    Route::delete('/games/{id}', [GameController::class, 'destroy']);

    // Game results
    Route::get('/results', [GameController::class, 'results']);
    Route::post('/results', [GameController::class, 'storeResult']);
    Route::post('/results/sync', [GameController::class, 'syncResult']);

    // Online multiplayer rooms
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::get('/rooms/{code}', [RoomController::class, 'show']);
    Route::post('/rooms/{code}/join', [RoomController::class, 'join']);
    Route::post('/rooms/{code}/leave', [RoomController::class, 'leave']);
    Route::patch('/rooms/{code}/player', [RoomController::class, 'updatePlayer']);
    Route::post('/rooms/{code}/ready', [RoomController::class, 'toggleReady']);
    Route::post('/rooms/{code}/start', [RoomController::class, 'startGame']);
    Route::get('/rooms/{code}/state', [RoomController::class, 'getState']);
    Route::post('/rooms/{code}/action', [RoomController::class, 'submitAction']);

    // Video streaming
    Route::post('/rooms/{code}/livekit/token', [StreamController::class, 'createAccessToken']);
    Route::post('/rooms/{code}/streaming', [StreamController::class, 'updateStreamingStatus']);
});
