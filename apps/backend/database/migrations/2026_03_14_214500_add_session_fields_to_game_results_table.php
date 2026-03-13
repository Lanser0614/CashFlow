<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_results', function (Blueprint $table) {
            $table->string('session_key')->nullable()->after('user_id');
            $table->boolean('is_completed')->default(true)->after('did_win');
            $table->unique(['user_id', 'session_key']);
        });
    }

    public function down(): void
    {
        Schema::table('game_results', function (Blueprint $table) {
            $table->dropUnique('game_results_user_id_session_key_unique');
            $table->dropColumn(['session_key', 'is_completed']);
        });
    }
};
