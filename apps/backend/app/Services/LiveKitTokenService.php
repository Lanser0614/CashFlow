<?php

namespace App\Services;

use App\Models\GameRoom;
use App\Models\User;
use RuntimeException;

class LiveKitTokenService
{
    public function issueRoomToken(GameRoom $room, User $user, string $participantName): array
    {
        $apiKey = (string) config('livekit.api_key');
        $apiSecret = (string) config('livekit.api_secret');

        if ($apiKey === '' || $apiSecret === '') {
            throw new RuntimeException('LiveKit credentials are not configured.');
        }

        $now = now()->timestamp;
        $identity = 'user-' . $user->id;

        $payload = [
            'iss' => $apiKey,
            'sub' => $identity,
            'nbf' => $now - 5,
            'exp' => $now + 21600,
            'name' => $participantName,
            'metadata' => json_encode([
                'user_id' => $user->id,
                'room_code' => $room->code,
            ], JSON_UNESCAPED_SLASHES),
            'video' => [
                'roomJoin' => true,
                'room' => $room->code,
                'canPublish' => true,
                'canSubscribe' => true,
                'canPublishData' => true,
            ],
        ];

        $jwt = $this->encodeJwt($payload, $apiSecret);

        return [
            'token' => $jwt,
            'ws_url' => config('livekit.ws_url'),
            'room_name' => $room->code,
            'participant_identity' => $identity,
            'participant_name' => $participantName,
        ];
    }

    private function encodeJwt(array $payload, string $secret): string
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $encodedHeader = $this->base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $encodedPayload = $this->base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature = hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $secret, true);

        return $encodedHeader . '.' . $encodedPayload . '.' . $this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
