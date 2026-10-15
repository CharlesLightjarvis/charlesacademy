<?php

namespace App\Http\Controllers\Learner;

use App\Actions\Learner\SubmitLessonQuiz;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\QuizQuestion;
use App\Services\LearningPathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LessonQuizController extends Controller
{
    public function show(Request $request, Module $module, Lesson $lesson, LearningPathService $learningPath): Response
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $quiz = $learningPath->activeQuizOf($lesson);
        abort_if($quiz === null || $quiz->questions->isEmpty(), 404);

        $user = $request->user();
        $level = $learningPath->levelOf($module);
        $modules = $learningPath->modulesOfLevel($user, $level);
        [$moduleNumber, $lessonNumber] = $learningPath->positionOf($module, $lesson, $modules);

        $progress = LessonProgress::query()
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        return Inertia::render('learner/learn/quiz', [
            'level' => $level->code->value,
            'module' => ['id' => $module->slug, 'title' => $module->name],
            'lesson' => ['id' => $lesson->slug, 'title' => $lesson->title],
            'moduleNumber' => $moduleNumber,
            'lessonNumber' => $lessonNumber,
            'quiz' => ['title' => $quiz->title ?? 'Quiz de la leçon'],
            'questions' => $quiz->questions->map(fn (QuizQuestion $question): array => [
                'id' => (string) $question->id,
                'prompt' => $question->prompt,
                'options' => $question->options,
            ])->values()->all(),
            'bestScore' => $progress?->best_score,
            'modules' => $modules,
        ]);
    }

    public function validateAnswer(Request $request, Module $module, Lesson $lesson, LearningPathService $learningPath): JsonResponse
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $quiz = $learningPath->activeQuizOf($lesson);
        abort_if($quiz === null || $quiz->questions->isEmpty(), 404);

        $validated = $request->validate([
            'question_id' => [
                'required',
                'integer',
                Rule::exists('quiz_questions', 'id')->where('quiz_id', $quiz->id),
            ],
            'answer' => ['required', 'string', 'max:255'],
        ]);

        $question = $quiz->questions->firstWhere('id', (int) $validated['question_id']);
        abort_if($question === null, 404);

        if (! array_key_exists($validated['answer'], $question->options)) {
            throw ValidationException::withMessages([
                'answer' => "Cette réponse n'existe pas pour cette question.",
            ]);
        }

        return response()->json([
            'selected' => $validated['answer'],
            'correct' => $question->correct_option,
            'explanation' => $question->explanation,
            'is_correct' => $validated['answer'] === $question->correct_option,
        ]);
    }

    public function submit(Request $request, Module $module, Lesson $lesson, LearningPathService $learningPath, SubmitLessonQuiz $submitLessonQuiz): RedirectResponse
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $quiz = $learningPath->activeQuizOf($lesson);
        abort_if($quiz === null || $quiz->questions->isEmpty(), 404);

        Inertia::flash('quizResult', $submitLessonQuiz->handle($request->user(), $lesson, $quiz, $request->all()));

        return redirect()->route('learner.learn.lesson.quiz.show', [$module->slug, $lesson->slug]);
    }
}
