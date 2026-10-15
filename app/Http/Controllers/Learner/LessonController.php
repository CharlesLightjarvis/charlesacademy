<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Services\LearningPathService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function show(Request $request, Module $module, Lesson $lesson, LearningPathService $learningPath): Response
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $user = $request->user();
        $level = $learningPath->levelOf($module);
        $modules = $learningPath->modulesOfLevel($user, $level);
        [$moduleNumber, $lessonNumber] = $learningPath->positionOf($module, $lesson, $modules);

        $progress = LessonProgress::query()
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        $quiz = $learningPath->activeQuizSummaryOf($lesson);

        return Inertia::render('learner/learn/show', [
            'level' => $level->code->value,
            'module' => ['id' => $module->slug, 'title' => $module->name],
            'lesson' => [
                'id' => $lesson->slug,
                'title' => $lesson->title,
                'introduction' => $lesson->description ?? '',
            ],
            'moduleNumber' => $moduleNumber,
            'lessonNumber' => $lessonNumber,
            'mdx' => $lesson->content,
            'quiz' => $quiz === null ? null : [
                'title' => $quiz->title,
                'length' => $quiz->questions_count,
                'bestScore' => $progress?->best_score,
            ],
            'modules' => $modules,
            'isRead' => (bool) $progress?->is_read,
        ]);
    }
}
