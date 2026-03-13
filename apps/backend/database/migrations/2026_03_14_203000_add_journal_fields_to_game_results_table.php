<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_results', function (Blueprint $table) {
            $table->string('game_mode')->default('classic')->after('user_id');
            $table->string('player_name')->nullable()->after('winner_name');
            $table->string('player_profession')->nullable()->after('winner_profession');
            $table->integer('player_cash')->default(0)->after('winner_cash');
            $table->integer('player_passive_income')->default(0)->after('winner_passive_income');
            $table->integer('player_net_worth')->default(0)->after('winner_net_worth');
            $table->boolean('did_win')->default(false)->after('player_count');
            $table->json('journal')->nullable()->after('player_summaries');
        });
    }

    public function down(): void
    {
        Schema::table('game_results', function (Blueprint $table) {
            $table->dropColumn([
                'game_mode',
                'player_name',
                'player_profession',
                'player_cash',
                'player_passive_income',
                'player_net_worth',
                'did_win',
                'journal',
            ]);
        });
    }
};
