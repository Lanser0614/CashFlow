<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_room_players', function (Blueprint $table) {
            $table->json('custom_financial_profile')->nullable()->after('profession_id');
        });
    }

    public function down(): void
    {
        Schema::table('game_room_players', function (Blueprint $table) {
            $table->dropColumn('custom_financial_profile');
        });
    }
};
