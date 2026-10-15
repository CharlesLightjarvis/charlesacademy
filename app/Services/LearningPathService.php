<?php

namespace App\Services;

use App\Enums\Level as LevelEnum;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Level;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\User;

class LearningPathService
{
    public function selectedLevel(?User $user): ?Level
    {
        if ($user?->learning_level === null) {
            return null;
        }

        return Level::query()->where('code', $user->learning_level)->first();
    }

    public function defaultLevel(): Level
    {
        return Level::query()->where('code', LevelEnum::A1->value)->first()
            ?? Level::query()->ordered()->firstOrFail();
    }

    public function levelOf(Module $module): Level
    {
        return $module->level
            ?? Level::query()->where('code', LevelEnum::A1->value)->firstOrFail();
    }

    /**
     * @return array<int, array{id: string, title: string, lessons: array<int, array{id: string, title: string, category: string, available: bool, read: bool, bestScore: int|null, quizLength: int|null}>}>
     */
    public function modulesOfLevel(?User $user, Level $level): array
    {
        $modules = Module::query()
            ->select(['id', 'level_id', 'slug', 'name', 'order_column', 'is_active'])
            ->where('is_active', true)
            ->where('level_id', $level->id)
            ->ordered()
            ->with(['lessons' => fn ($query) => $query
                ->select(['id', 'module_id', 'slug', 'title', 'description', 'is_active', 'order_column'])
                ->ordered()
                ->with(['quiz' => fn ($quizQuery) => $quizQuery
                    ->select(['id', 'lesson_id', 'is_active'])
                    ->withCount('questions')])])
            ->get();

        $progressions = $user === null
            ? collect()
            : LessonProgress::query()
                ->select(['lesson_id', 'is_read', 'best_score'])
                ->where('user_id', $user->id)
                ->whereIn('lesson_id', $modules->flatMap(fn (Module $module) => $module->lessons->pluck('id'))->all())
                ->get()
                ->keyBy('lesson_id');

        return $modules->map(function (Module $module) use ($progressions): array {
            return [
                'id' => $module->slug,
                'title' => $module->name,
                'lessons' => $module->lessons->map(function (Lesson $lesson) use ($module, $progressions): array {
                    $progress = $progressions->get($lesson->id);
                    $quiz = $lesson->quiz;

                    return [
                        'id' => $lesson->slug,
                        'title' => $lesson->title,
                        'category' => $lesson->description ?? $module->name,
                        'available' => $lesson->is_active,
                        'read' => (bool) $progress?->is_read,
                        'bestScore' => $progress?->best_score,
                        'quizLength' => $quiz !== null && $quiz->is_active ? $quiz->questions_count : null,
                    ];
                })->all(),
            ];
        })->all();
    }

    public function activeQuizOf(Lesson $lesson): ?Quiz
    {
        return $lesson->quiz()
            ->where('is_active', true)
            ->with(['questions' => fn ($query) => $query->ordered()])
            ->first();
    }

    public function activeQuizSummaryOf(Lesson $lesson): ?Quiz
    {
        return $lesson->quiz()
            ->where('is_active', true)
            ->withCount('questions')
            ->first();
    }

    /**
     * @param  array<int, array{id: string, title: string, lessons: array<int, array{id: string, title: string, category: string, available: bool, read: bool, bestScore: int|null, quizLength: int|null}>}>  $modules
     * @return array{0: int, 1: int}
     */
    public function positionOf(Module $module, Lesson $lesson, array $modules): array
    {
        $moduleIndex = array_search($module->slug, array_column($modules, 'id'), true);
        $lessonData = $moduleIndex === false ? [] : $modules[$moduleIndex]['lessons'] ?? [];
        $lessonIndex = array_search($lesson->slug, array_column($lessonData, 'id'), true);

        return [
            $moduleIndex === false ? 1 : $moduleIndex + 1,
            $lessonIndex === false ? 1 : $lessonIndex + 1,
        ];
    }
}
