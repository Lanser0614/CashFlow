<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_rooms', function (Blueprint $table) {
            $table->string('game_mode')->default('cashflow101_classic')->after('max_players');
        });

        Schema::table('game_saves', function (Blueprint $table) {
            $table->string('game_mode')->default('cashflow101_classic')->after('user_id');
        });

        DB::table('game_results')
            ->where('game_mode', 'classic')
            ->update(['game_mode' => 'cashflow101_classic']);

        DB::table('game_results')
            ->where('game_mode', 'quick')
            ->update(['game_mode' => 'cashflow101_quick']);
    }

    public function down(): void
    {
        DB::table('game_results')
            ->where('game_mode', 'cashflow101_classic')
            ->update(['game_mode' => 'classic']);

        DB::table('game_results')
            ->where('game_mode', 'cashflow101_quick')
            ->update(['game_mode' => 'quick']);

        Schema::table('game_saves', function (Blueprint $table) {
            $table->dropColumn('game_mode');
        });

        Schema::table('game_rooms', function (Blueprint $table) {
            $table->dropColumn('game_mode');
        });
    }
};
