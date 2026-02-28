<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('winner_name');
            $table->string('winner_profession');
            $table->integer('winner_cash');
            $table->integer('winner_passive_income');
            $table->integer('winner_net_worth');
            $table->integer('player_count');
            $table->json('player_summaries');
            $table->integer('total_turns')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_results');
    }
};
