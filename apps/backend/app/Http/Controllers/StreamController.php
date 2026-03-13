<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Models\RoomParticipant;
use App\Services\JanusService;
use App\Services\NatsPublisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreamController extends Controller
{
    public function __construct(
        private JanusService $janus,
        private NatsPublisher $nats,
    ) {
    }

    /**
     * Create a Janus VideoRoom for the game room.
     */
    public function createVideoRoom(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = GameRoom::where('code', $code)->firstOrFail();

        if ($room->host_user_id !== $user->id) {
            return response()->json(['message' => 'Only host can create video room'], 403);
        }

        if ($room->janus_room_id) {
            return response()->json([
                'janus_room_id' => $room->janus_room_id,
            ]);
        }

        $janusRoomId = $this->janus->createRoom($room->id);

        $room->update(['janus_room_id' => $janusRoomId]);

        $this->nats->roomEvent($code, 'room_created', [
            'janus_room_id' => $janusRoomId,
        ]);

        return response()->json([
            'janus_room_id' => $janusRoomId,
        ], 201);
    }

    /**
     * Get Janus VideoRoom info for frontend connection.
     */
    public function getVideoRoomInfo(string $code): JsonResponse
    {
        $room = GameRoom::where('code', $code)->firstOrFail();

        // Auto-assign janus_room_id if not set (deterministic, no external call)
        if (!$room->janus_room_id) {
            $room->update(['janus_room_id' => $this->janus->createRoom($room->id)]);
            $room->refresh();
        }

        $participants = RoomParticipant::where('room_id', $room->id)
            ->whereNull('left_at')
            ->get(['user_id', 'is_streaming', 'role']);

        return response()->json([
            'janus_room_id' => $room->janus_room_id,
            'participants' => $participants,
        ]);
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

    /**
     * Destroy Janus VideoRoom.
     */
    public function destroyVideoRoom(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = GameRoom::where('code', $code)->firstOrFail();

        if ($room->host_user_id !== $user->id) {
            return response()->json(['message' => 'Only host can destroy video room'], 403);
        }

        if ($room->janus_room_id) {
            try {
                $this->janus->destroyRoom($room->janus_room_id);
            } catch (\Throwable $e) {
                // Room may not exist in Janus anymore, that's ok
            }

            $room->update(['janus_room_id' => null]);

            $this->nats->roomEvent($code, 'room_destroyed', []);
        }

        return response()->json(['message' => 'Video room destroyed']);
    }
}
