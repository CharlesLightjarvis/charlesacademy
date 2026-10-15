<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getColumnType('lesson_progress', 'user_id') !== 'uuid') {
            Schema::table('lesson_progress', function (Blueprint $table): void {
                $table->dropForeign(['user_id']);
            });

            Schema::table('lesson_progress', function (Blueprint $table): void {
                $table->uuid('user_id')->change();
            });

            Schema::table('lesson_progress', function (Blueprint $table): void {
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }

        Schema::table('lesson_progress', function (Blueprint $table): void {
            $table->unsignedInteger('score')->nullable()->change();
            $table->unsignedInteger('best_score')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Reverting UUIDs to integers would discard existing learner progress.
    }
};
