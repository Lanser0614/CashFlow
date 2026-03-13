<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_room_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_room_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('player_index');
            $table->string('player_name');
            $table->string('profession_id')->default('teacher');
            $table->string('color', 7)->default('#6366f1');
            $table->boolean('is_ready')->default(false);
            $table->timestamps();

            $table->unique(['game_room_id', 'user_id']);
            $table->unique(['game_room_id', 'player_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_room_players');
    }
};
