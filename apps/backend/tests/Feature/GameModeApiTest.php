<?php

namespace Tests\Feature;

use App\Models\GameRoomPlayer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameModeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_room_with_requested_game_mode(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/rooms', [
            'max_players' => 4,
            'game_mode' => 'cashflow202',
        ]);

        $response->assertCreated()
            ->assertJsonPath('game_mode', 'cashflow202');

        $this->assertDatabaseHas('game_rooms', [
            'host_user_id' => $user->id,
            'game_mode' => 'cashflow202',
        ]);
    }

    public function test_host_can_switch_room_game_mode_and_invalid_professions_reset(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();

        $roomResponse = $this->actingAs($host)->postJson('/api/rooms', [
            'max_players' => 4,
            'game_mode' => 'cashflow202',
        ]);

        $roomCode = $roomResponse->json('code');

        $this->actingAs($guest)->postJson("/api/rooms/{$roomCode}/join");

        $roomId = $roomResponse->json('id');
        GameRoomPlayer::where('game_room_id', $roomId)
            ->where('user_id', $guest->id)
            ->update([
                'profession_id' => 'doctor',
                'is_ready' => true,
            ]);

        $response = $this->actingAs($host)->patchJson("/api/rooms/{$roomCode}/settings", [
            'game_mode' => 'cashflow101_quick',
        ]);

        $response->assertOk()
            ->assertJsonPath('game_mode', 'cashflow101_quick');

        $this->assertDatabaseHas('game_rooms', [
            'id' => $roomId,
            'game_mode' => 'cashflow101_quick',
        ]);

        $this->assertDatabaseHas('game_room_players', [
            'game_room_id' => $roomId,
            'user_id' => $guest->id,
            'profession_id' => 'teacher',
            'is_ready' => false,
        ]);
    }

    public function test_player_can_use_custom_financial_profile_in_room(): void
    {
        $host = User::factory()->create();

        $roomResponse = $this->actingAs($host)->postJson('/api/rooms', [
            'max_players' => 4,
            'game_mode' => 'cashflow101_classic',
        ]);

        $roomCode = $roomResponse->json('code');

        $response = $this->actingAs($host)->patchJson("/api/rooms/{$roomCode}/player", [
            'profession_id' => 'custom_user_profile',
            'custom_financial_profile' => [
                'startingCash' => 7777,
                'salary' => 12345,
                'taxes' => 2100,
                'mortgage' => 900,
                'carLoan' => 250,
                'creditCard' => 80,
                'schoolLoan' => 60,
                'otherExpenses' => 931,
                'childExpenses' => 175,
                'homeMortgageBalance' => 85000,
                'carLoanBalance' => 12000,
                'creditCardBalance' => 3400,
                'schoolLoanBalance' => 8000,
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('players.0.profession_id', 'custom_user_profile')
            ->assertJsonPath('players.0.custom_financial_profile.startingCash', 7777)
            ->assertJsonPath('players.0.custom_financial_profile.salary', 12345)
            ->assertJsonPath('players.0.custom_financial_profile.otherExpenses', 931);

        $player = GameRoomPlayer::firstOrFail();

        $this->assertSame('custom_user_profile', $player->profession_id);
        $this->assertSame([
            'startingCash' => 7777,
            'salary' => 12345,
            'taxes' => 2100,
            'mortgage' => 900,
            'carLoan' => 250,
            'creditCard' => 80,
            'schoolLoan' => 60,
            'otherExpenses' => 931,
            'childExpenses' => 175,
            'homeMortgageBalance' => 85000,
            'carLoanBalance' => 12000,
            'creditCardBalance' => 3400,
            'schoolLoanBalance' => 8000,
        ], $player->custom_financial_profile);
    }
}
