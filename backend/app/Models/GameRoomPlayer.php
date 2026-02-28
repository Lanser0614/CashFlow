<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameRoomPlayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_room_id',
        'user_id',
        'player_index',
        'player_name',
        'profession_id',
        'color',
        'is_ready',
    ];

    protected $casts = [
        'is_ready' => 'boolean',
        'player_index' => 'integer',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(GameRoom::class, 'game_room_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
