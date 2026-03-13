<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Models\GameRoomPlayer;
use App\Models\RoomParticipant;
use App\Services\JanusService;
use App\Services\NatsPublisher;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoomController extends Controller
{
    public function __construct(
        private JanusService $janus,
        private NatsPublisher $nats,
    ) {
    }

    private const PLAYER_COLORS = [
        '#6366f1', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#14b8a6',
    ];

    /**
     * Create a new room.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'max_players' => 'integer|min:2|max:6',
        ]);

        $user = $request->user();

        $room = GameRoom::create([
            'code' => GameRoom::generateCode(),
            'host_user_id' => $user->id,
            'status' => 'waiting',
            'max_players' => $request->input('max_players', 6),
        ]);

        // Auto-add host as first player
        GameRoomPlayer::create([
            'game_room_id' => $room->id,
            'user_id' => $user->id,
            'player_index' => 0,
            'player_name' => $user->name,
            'profession_id' => 'teacher',
            'color' => self::PLAYER_COLORS[0],
        ]);

        $room->load('players');

        return response()->json($room, 201);
    }

    /**
     * Get room info with players.
     */
    public function show(string $code): JsonResponse
    {
        $room = GameRoom::where('code', $code)->with('players')->firstOrFail();

        return response()->json($room);
    }

    /**
     * Join a room.
     */
    public function join(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = GameRoom::where('code', $code)->with('players')->firstOrFail();

        if ($room->status !== 'waiting') {
            return response()->json(['message' => 'Game already started'], 422);
        }

        if ($room->players->count() >= $room->max_players) {
            return response()->json(['message' => 'Room is full'], 422);
        }

        // Check if already in room
        if ($room->players->where('user_id', $user->id)->count() > 0) {
            return response()->json($room);
        }

        $nextIndex = $room->players->max('player_index') + 1;

        GameRoomPlayer::create([
            'game_room_id' => $room->id,
            'user_id' => $user->id,
            'player_index' => $nextIndex,
            'player_name' => $user->name,
            'profession_id' => 'engineer',
            'color' => self::PLAYER_COLORS[$nextIndex % count(self::PLAYER_COLORS)],
        ]);

        $room->load('players');

        return response()->json($room);
    }

    /**
     * Leave a room.
     */
    public function leave(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = GameRoom::where('code', $code)->with('players')->firstOrFail();

        if ($room->status !== 'waiting') {
            return response()->json(['message' => 'Cannot leave during game'], 422);
        }

        $player = $room->players->where('user_id', $user->id)->first();
        if (!$player) {
            return response()->json(['message' => 'Not in room'], 422);
        }

        $player->delete();

        // Clean up streaming state
        RoomParticipant::where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->update(['is_streaming' => false, 'left_at' => now()]);

        $this->nats->roomEvent($code, 'player_left', [
            'user_id' => $user->id,
        ]);

        // If host left, transfer or delete room
        if ($room->host_user_id === $user->id) {
            $remaining = GameRoomPlayer::where('game_room_id', $room->id)->orderBy('player_index')->first();
            if ($remaining) {
                $room->update(['host_user_id' => $remaining->user_id]);
            } else {
                // Destroy Janus room if exists
                if ($room->janus_room_id) {
                    try {
                        $this->janus->destroyRoom($room->janus_room_id);
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }
                $room->delete();
                return response()->json(['message' => 'Room deleted']);
            }
        }

        // Reindex remaining players
        $remaining = GameRoomPlayer::where('game_room_id', $room->id)
            ->orderBy('player_index')
            ->get();
        foreach ($remaining as $i => $p) {
            $p->update([
                'player_index' => $i,
                'color' => self::PLAYER_COLORS[$i % count(self::PLAYER_COLORS)],
            ]);
        }

        $room->load('players');

        return response()->json($room);
    }

    /**
     * Update own player config (name, profession).
     */
    public function updatePlayer(Request $request, string $code): JsonResponse
    {
        $request->validate([
            'player_name' => 'sometimes|string|max:20',
            'profession_id' => 'sometimes|string|max:50',
        ]);

        $user = $request->user();
        $room = GameRoom::where('code', $code)->firstOrFail();

        if ($room->status !== 'waiting') {
            return response()->json(['message' => 'Cannot update during game'], 422);
        }

        $player = GameRoomPlayer::where('game_room_id', $room->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $player->update($request->only(['player_name', 'profession_id']));

        $room->load('players');

        return response()->json($room);
    }

    /**
     * Toggle ready status.
     */
    public function toggleReady(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = GameRoom::where('code', $code)->firstOrFail();

        if ($room->status !== 'waiting') {
            return response()->json(['message' => 'Game already started'], 422);
        }

        $player = GameRoomPlayer::where('game_room_id', $room->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $player->update(['is_ready' => !$player->is_ready]);

        $room->load('players');

        return response()->json($room);
    }

    /**
     * Start the game (host only).
     */
    public function startGame(Request $request, string $code): JsonResponse
    {
        $user = $request->user();
        $room = GameRoom::where('code', $code)->with('players')->firstOrFail();

        if ($room->host_user_id !== $user->id) {
            return response()->json(['message' => 'Only host can start'], 403);
        }

        if ($room->status !== 'waiting') {
            return response()->json(['message' => 'Game already started'], 422);
        }

        if ($room->players->count() < 2) {
            return response()->json(['message' => 'Need at least 2 players'], 422);
        }

        $allReady = $room->players->every(fn($p) => $p->is_ready || $p->user_id === $room->host_user_id);
        if (!$allReady) {
            return response()->json(['message' => 'Not all players are ready'], 422);
        }

        // Create Janus VideoRoom
        $janusRoomId = 1000000 + $room->id;
        try {
            $this->janus->createRoom($janusRoomId, $room->max_players);
        } catch (\Throwable $e) {
            // Log but don't block game start if Janus is unavailable
            \Log::warning('Failed to create Janus room: ' . $e->getMessage());
            $janusRoomId = null;
        }

        $room->update([
            'status' => 'playing',
            'state_version' => 0,
            'janus_room_id' => $janusRoomId,
        ]);

        $this->nats->roomEvent($code, 'game_started', [
            'janus_room_id' => $janusRoomId,
        ]);

        return response()->json(['status' => 'playing', 'janus_room_id' => $janusRoomId, 'players' => $room->players]);
    }

    /**
     * Poll game state.
     */
    public function getState(Request $request, string $code): JsonResponse
    {
        $room = GameRoom::where('code', $code)->firstOrFail();

        $clientVersion = (int) $request->query('v', 0);

        if ($clientVersion >= $room->state_version && $room->game_state !== null) {
            return response()->json(null, 304);
        }

        return response()->json([
            'game_state' => $room->game_state,
            'state_version' => $room->state_version,
            'status' => $room->status,
        ]);
    }

    /**
     * Submit a game action (update state).
     */
    public function submitAction(Request $request, string $code): JsonResponse
    {
        $request->validate([
            'game_state' => 'required|array',
            'state_version' => 'required|integer',
        ]);

        $user = $request->user();
        $room = GameRoom::where('code', $code)->with('players')->firstOrFail();

        if ($room->status !== 'playing') {
            return response()->json(['message' => 'Game not in progress'], 422);
        }

        // Version check (optimistic locking)
        $expectedVersion = $room->state_version + 1;
        if ($request->input('state_version') !== $expectedVersion) {
            return response()->json([
                'message' => 'Version conflict',
                'expected' => $expectedVersion,
                'received' => $request->input('state_version'),
            ], 409);
        }

        // Verify it's this player's turn
        $player = $room->players->where('user_id', $user->id)->first();
        if (!$player) {
            return response()->json(['message' => 'Not a player in this room'], 403);
        }

        // For the first action (version 0->1), allow host. Otherwise check currentPlayerIndex.
        if ($room->state_version > 0 && $room->game_state) {
            $currentIndex = $room->game_state['currentPlayerIndex'] ?? 0;
            if ($player->player_index !== $currentIndex) {
                return response()->json(['message' => 'Not your turn'], 403);
            }
        }

        $newState = $request->input('game_state');
        $newStatus = ($newState['phase'] ?? '') === 'won' ? 'finished' : 'playing';

        $room->update([
            'game_state' => $newState,
            'state_version' => $expectedVersion,
            'status' => $newStatus,
        ]);

        return response()->json(['state_version' => $expectedVersion]);
    }
}
