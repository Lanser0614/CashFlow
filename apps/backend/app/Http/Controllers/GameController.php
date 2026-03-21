<?php

namespace App\Http\Controllers;

use App\GameVariants\GameVariant;
use App\Models\GameResult;
use App\Models\GameSave;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $saves = GameSave::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get(['id', 'game_mode', 'name', 'player_count', 'current_player_name', 'turn_number', 'created_at', 'updated_at']);

        return response()->json($saves);
    }

    public function store(Request $request)
    {
        $request->validate([
            'game_mode' => 'required|string',
            'name' => 'required|string|max:255',
            'game_state' => 'required|array',
            'player_count' => 'required|integer',
            'current_player_name' => 'required|string',
            'turn_number' => 'integer',
        ]);

        $gameVariant = GameVariant::fromInput($request->input('game_mode'));
        if ($gameVariant === null) {
            throw ValidationException::withMessages([
                'game_mode' => 'Unknown game variant.',
            ]);
        }

        $save = GameSave::create([
            'user_id' => $request->user()->id,
            'game_mode' => $gameVariant->value,
            'name' => $request->name,
            'game_state' => $request->game_state,
            'player_count' => $request->player_count,
            'current_player_name' => $request->current_player_name,
            'turn_number' => $request->turn_number ?? 0,
        ]);

        return response()->json($save, 201);
    }

    public function show(Request $request, $id)
    {
        $save = GameSave::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json($save);
    }

    public function update(Request $request, $id)
    {
        $save = GameSave::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'game_mode' => 'required|string',
            'name' => 'sometimes|string|max:255',
            'game_state' => 'required|array',
            'player_count' => 'required|integer',
            'current_player_name' => 'required|string',
            'turn_number' => 'integer',
        ]);

        $gameVariant = GameVariant::fromInput($request->input('game_mode'));
        if ($gameVariant === null) {
            throw ValidationException::withMessages([
                'game_mode' => 'Unknown game variant.',
            ]);
        }

        $save->update($request->only([
            'name', 'game_state', 'player_count',
            'current_player_name', 'turn_number',
        ]) + ['game_mode' => $gameVariant->value]);

        return response()->json($save);
    }

    public function destroy(Request $request, $id)
    {
        $save = GameSave::where('user_id', $request->user()->id)->findOrFail($id);
        $save->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function results(Request $request)
    {
        return GameResult::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get();
    }

    public function storeResult(Request $request)
    {
        return $this->syncResult($request);
    }

    public function syncResult(Request $request)
    {
        $request->validate([
            'session_key' => 'required|string|max:100',
            'game_mode' => 'required|string',
            'winner_name' => 'required|string',
            'winner_profession' => 'required|string',
            'winner_cash' => 'required|integer',
            'winner_passive_income' => 'required|integer',
            'winner_net_worth' => 'required|integer',
            'player_name' => 'nullable|string',
            'player_profession' => 'nullable|string',
            'player_cash' => 'required|integer',
            'player_passive_income' => 'required|integer',
            'player_net_worth' => 'required|integer',
            'player_count' => 'required|integer',
            'did_win' => 'required|boolean',
            'is_completed' => 'required|boolean',
            'player_summaries' => 'present|array',
            'journal' => 'present|array',
            'total_turns' => 'integer',
        ]);

        $gameVariant = GameVariant::fromInput($request->input('game_mode'));
        if ($gameVariant === null) {
            throw ValidationException::withMessages([
                'game_mode' => 'Unknown game variant.',
            ]);
        }

        $result = GameResult::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'session_key' => $request->string('session_key')->toString(),
            ],
            $request->only([
                'winner_name', 'winner_profession', 'winner_cash',
                'winner_passive_income', 'winner_net_worth',
                'player_name', 'player_profession', 'player_cash',
                'player_passive_income', 'player_net_worth',
                'player_count', 'did_win', 'is_completed', 'player_summaries', 'journal', 'total_turns',
            ]) + ['game_mode' => $gameVariant->value]
        );

        return response()->json($result, 201);
    }
}
