<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Models\GameRoomPlayer;
use App\Models\RoomParticipant;
use App\Services\LiveKitTokenService;
use App\Services\NatsPublisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreamController extends Controller
{
    public function __construct(
        private LiveKitTokenService $liveKit,
        private NatsPublisher $nats,
    ) {
    }

    /**
     * Issue a LiveKit access token for the authenticated room participant.
     */
    public function createAccessToken(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = GameRoom::where('code', $code)->with('players')->firstOrFail();
        $player = GameRoomPlayer::where('game_room_id', $room->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$player) {
            return response()->json(['message' => 'You are not a participant of this room'], 403);
        }

        return response()->json(
            $this->liveKit->issueRoomToken($room, $user, $player->player_name ?: $user->name)
        );
    }

    /**
     * Update streaming status for current user.
     */
    public function updateStreamingStatus(Request $request, string $code): JsonResponse
    {
        $request->validate([
            'is_streaming' => 'required|boolean',
        ]);

        $user = $request->user();
        $room = GameRoom::where('code', $code)->firstOrFail();

        $participant = RoomParticipant::updateOrCreate(
            ['room_id' => $room->id, 'user_id' => $user->id],
            [
                'is_streaming' => $request->boolean('is_streaming'),
                'joined_at' => now(),
            ]
        );

        $event = $request->boolean('is_streaming') ? 'started' : 'stopped';

        $this->nats->roomEvent($code, $event, [
            'user_id' => $user->id,
            'player_name' => $user->name,
        ]);

        return response()->json($participant);
    }
}
