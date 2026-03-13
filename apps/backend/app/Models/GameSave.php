<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameSave extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'game_state',
        'player_count',
        'current_player_name',
        'turn_number',
    ];

    protected $casts = [
        'game_state' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
