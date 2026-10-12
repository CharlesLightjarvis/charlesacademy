<?php

namespace App\Http\Controllers\Learner;

use App\Enums\Level as LevelEnum;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Level;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LearnController extends Controller
{
    /**
     * Parcours d'apprentissage : les niveaux de la base, avec les modules
     * publiés (et leurs leçons) du niveau choisi par l'apprenant.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $selectedLevel = $this->selectedLevel($user);
        // Sans niveau choisi, la page prévisualise A1 : il faut lui envoyer
        // les modules de ce niveau-là, sinon la page s'affiche vide.
        $previewLevel = $selectedLevel ?? $this->defaultLevel();

        return Inertia::render('learner/learn/index', [
            'levels' => Level::query()
                ->ordered()
                ->get()
                ->map(fn (Level $level): array => [
                    'code' => $level->code->value,
                    'label' => $level->code->label(),
                    'modules' => $level->is($previewLevel)
                        ? $this->modulesOfLevel($user, $level)
                        : [],
                ])
                ->all(),
            'selectedLevel' => $selectedLevel?->code->value,
            'defaultLevel' => $previewLevel->code->value,
        ]);
    }

    /**
     * Mémorise le niveau choisi (users.learning_level, code CECRL).
     */
    public function updateLevel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'level' => ['required', Rule::in(Level::query()->pluck('code')->all())],
        ]);

        $request->user()->update(['learning_level' => $validated['level']]);

        return back();
    }

    /**
     * Une leçon publiée : contenu MDX, progression, quiz éventuel et
     * données de navigation (sidebar, fil d'Ariane).
     */
    public function show(Request $request, Module $module, Lesson $lesson): Response
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $user = $request->user();
        $level = $module->level ?? Level::query()->where('code', LevelEnum::A1->value)->firstOrFail();
        $modules = $this->modulesOfLevel($user, $level);
        [$moduleNumber, $lessonNumber] = $this->positionOf($module, $lesson, $modules);

        $progress = LessonProgress::query()
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        $quiz = $this->activeQuizOf($lesson);

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
                'length' => $quiz->questions->count(),
                'bestScore' => $progress?->best_score,
            ],
            'modules' => $modules,
            'isRead' => (bool) $progress?->is_read,
        ]);
    }

    /**
     * La page du quiz d'une leçon : une question à la fois, corrigée à la fin.
     */
    public function showQuiz(Request $request, Module $module, Lesson $lesson): Response
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $quiz = $this->activeQuizOf($lesson);
        abort_if($quiz === null || $quiz->questions->isEmpty(), 404);

        $user = $request->user();
        $level = $module->level ?? Level::query()->where('code', LevelEnum::A1->value)->firstOrFail();
        $modules = $this->modulesOfLevel($user, $level);
        [$moduleNumber, $lessonNumber] = $this->positionOf($module, $lesson, $modules);

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
            // Les réponses et explications ne partent jamais vers le front.
            'questions' => $quiz->questions->map(fn (QuizQuestion $question): array => [
                'id' => (string) $question->id,
                'prompt' => $question->prompt,
                'options' => $question->options,
            ])->values()->all(),
            'bestScore' => $progress?->best_score,
            'modules' => $modules,
        ]);
    }

    /**
     * Bascule l'état « Lu / Non lu » de la leçon pour l'apprenant.
     */
    public function toggleRead(Request $request, Module $module, Lesson $lesson): RedirectResponse
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $progress = LessonProgress::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
        ]);

        $progress->is_read = ! $progress->is_read;
        $progress->save();

        return back();
    }

    /**
     * Corrige le quiz de la leçon, enregistre le score et renvoie les
     * corrections via le flash Inertia (quizResult partagé par le middleware).
     */
    public function submitQuiz(Request $request, Module $module, Lesson $lesson): RedirectResponse
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $quiz = $this->activeQuizOf($lesson);
        abort_if($quiz === null || $quiz->questions->isEmpty(), 404);

        $questions = $quiz->questions;

        $rules = [];
        foreach ($questions as $question) {
            $rules["answers.{$question->id}"] = ['required', Rule::in(array_keys($question->options))];
        }
        $answers = $request->validate($rules)['answers'];

        $corrections = [];
        $score = 0;

        foreach ($questions as $question) {
            $selected = $answers[$question->id];
            $isCorrect = $selected === $question->correct_option;

            if ($isCorrect) {
                $score++;
            }

            $corrections[$question->id] = [
                'selected' => $selected,
                'correct' => $question->correct_option,
                'explanation' => $question->explanation,
                'is_correct' => $isCorrect,
            ];
        }

        $progress = LessonProgress::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
        ]);

        $progress->score = $score;
        $progress->best_score = max($progress->best_score ?? 0, $score);
        $progress->completed_at = now();
        $progress->save();

        return redirect()
            ->route('learner.learn.lesson.quiz.show', [$module->slug, $lesson->slug])
            ->with('quizResult', [
                'score' => $score,
                'total' => $questions->count(),
                'bestScore' => $progress->best_score,
                'corrections' => $corrections,
            ]);
    }

    /**
     * Niveau courant de l'apprenant (ou null s'il n'en a pas encore choisi).
     */
    private function selectedLevel(?User $user): ?Level
    {
        if ($user === null || $user->learning_level === null) {
            return null;
        }

        return Level::query()->where('code', $user->learning_level)->first();
    }

    /**
     * Niveau prévisualisé quand l'apprenant n'en a pas encore choisi : A1,
     * ou le premier niveau de la base s'il n'existe pas.
     */
    private function defaultLevel(): Level
    {
        return Level::query()->where('code', LevelEnum::A1->value)->first()
            ?? Level::query()->ordered()->firstOrFail();
    }

    /**
     * Les modules actifs d'un niveau, avec leurs leçons et la progression
     * de l'apprenant : c'est la forme de données des pages étudiantes.
     *
     * @return array<int, array{id: string, title: string, lessons: array<int, array{id: string, title: string, category: string, available: bool, read: bool, bestScore: int|null, quizLength: int|null}>}>
     */
    private function modulesOfLevel(?User $user, Level $level): array
    {
        $modules = Module::query()
            ->where('is_active', true)
            ->where('level_id', $level->id)
            ->ordered()
            ->with(['lessons' => fn ($query) => $query->ordered()->with('quiz.questions')])
            ->get();

        $progressions = $user === null
            ? collect()
            : LessonProgress::query()
                ->where('user_id', $user->id)
                ->whereIn('lesson_id', $modules->flatMap(fn (Module $module) => $module->lessons->pluck('id'))->all())
                ->get()
                ->keyBy('lesson_id');

        return $modules->map(function (Module $module) use ($progressions) {
            return [
                'id' => $module->slug,
                'title' => $module->name,
                'lessons' => $module->lessons->map(function (Lesson $lesson) use ($module, $progressions) {
                    $progress = $progressions->get($lesson->id);
                    $quiz = $lesson->quiz;

                    return [
                        'id' => $lesson->slug,
                        'title' => $lesson->title,
                        'category' => $lesson->description ?? $module->name,
                        'available' => $lesson->is_active,
                        'read' => (bool) $progress?->is_read,
                        'bestScore' => $progress?->best_score,
                        'quizLength' => $quiz !== null && $quiz->is_active ? $quiz->questions->count() : null,
                    ];
                })->all(),
            ];
        })->all();
    }

    /**
     * Le quiz actif d'une leçon, avec ses questions dans l'ordre (null si
     * la leçon n'en a pas ou s'il est désactivé).
     */
    private function activeQuizOf(Lesson $lesson): ?Quiz
    {
        return $lesson->quiz()
            ->where('is_active', true)
            ->with(['questions' => fn ($query) => $query->ordered()])
            ->first();
    }

    /**
     * Numéro du module et numéro de la leçon dans le parcours affiché.
     *
     * @param  array<int, array{id: string, title: string, lessons: array<int, array{id: string, title: string, category: string, available: bool, read: bool, bestScore: int|null, quizLength: int|null}>}>  $modules
     * @return array{0: int, 1: int}
     */
    private function positionOf(Module $module, Lesson $lesson, array $modules): array
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
