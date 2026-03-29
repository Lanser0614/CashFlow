<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function callback(Request $request)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/auth/google/callback?error=google_auth_failed");
        }

        // Find existing user by google_id
        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            // Generate unique username from email prefix
            $baseUsername = Str::before($googleUser->getEmail(), '@');
            $username = $baseUsername;
            $counter = 1;

            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . $counter;
                $counter++;
            }

            $user = User::create([
                'name' => $googleUser->getName(),
                'username' => $username,
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => null,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        $userData = urlencode(json_encode($user->only('id', 'name', 'username')));

        return redirect("{$frontendUrl}/auth/google/callback?token={$token}&user={$userData}");
    }
}
