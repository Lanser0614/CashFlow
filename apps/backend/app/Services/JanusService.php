<?php

namespace App\Services;

class JanusService
{
    /**
     * Generate a deterministic Janus VideoRoom ID from game room ID.
     * The frontend creates the actual room via Janus WebSocket API.
     */
    public function getRoomId(int $gameRoomId): int
    {
        return 1000000 + $gameRoomId;
    }

    /**
     * Assign a Janus room ID to a game room (no Janus HTTP call needed).
     */
    public function createRoom(int $gameRoomId): int
    {
        return $this->getRoomId($gameRoomId);
    }

    /**
     * No-op: room cleanup happens via frontend Janus WebSocket when last participant leaves.
     */
    public function destroyRoom(int $roomId): void
    {
        // Frontend handles room destruction via Janus WebSocket
    }
}
