<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameResult extends Model
{
    protected $fillable = [
        'user_id',
        'winner_name',
        'winner_profession',
        'winner_cash',
        'winner_passive_income',
        'winner_net_worth',
        'player_count',
        'player_summaries',
        'total_turns',
    ];

    protected $casts = [
        'player_summaries' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
