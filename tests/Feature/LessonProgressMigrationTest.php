<?php

use App\Models\Module;
use App\Models\User;
use Database\Seeders\LevelSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('legacy learner progress survives the UUID migration', function () {
    $this->seed(LevelSeeder::class);
    $user = User::factory()->create();
    $lesson = Module::factory()->create()->lessons()->create(['title' => 'Leçon existante']);

    Schema::drop('lesson_progress');
    Schema::create('lesson_progress', function (Blueprint $table): void {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
        $table->boolean('is_read')->default(false);
        $table->unsignedTinyInteger('score')->nullable();
        $table->unsignedTinyInteger('best_score')->nullable();
        $table->timestamp('completed_at')->nullable();
        $table->timestamps();
        $table->unique(['user_id', 'lesson_id']);
    });
    DB::table('lesson_progress')->insert([
        'user_id' => $user->id,
        'lesson_id' => $lesson->id,
        'is_read' => true,
        'score' => 1,
        'best_score' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $migration = require database_path('migrations/2026_10_15_000000_fix_lesson_progress_user_id.php');
    $migration->up();

    $progress = DB::table('lesson_progress')->first();
    expect(Schema::getColumnType('lesson_progress', 'user_id'))->toBe('varchar');
    expect($progress->user_id)->toBe($user->id);
    expect((int) $progress->best_score)->toBe(1);
    expect((int) $progress->is_read)->toBe(1);
});
