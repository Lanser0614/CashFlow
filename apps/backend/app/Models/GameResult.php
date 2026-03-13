<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameResult extends Model
{
    protected $fillable = [
        'user_id',
        'session_key',
        'game_mode',
        'winner_name',
        'player_name',
        'winner_profession',
        'player_profession',
        'winner_cash',
        'player_cash',
        'winner_passive_income',
        'player_passive_income',
        'winner_net_worth',
        'player_net_worth',
        'player_count',
        'did_win',
        'is_completed',
        'player_summaries',
        'journal',
        'total_turns',
    ];

    protected $casts = [
        'did_win' => 'boolean',
        'is_completed' => 'boolean',
        'player_summaries' => 'array',
        'journal' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
