<?php

namespace App\Http\Controllers\Learner;

use App\Enums\Level as LevelEnum;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Level;
use App\Models\Module;
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

        return Inertia::render('learner/learn/index', [
            'levels' => Level::query()
                ->ordered()
                ->get()
                ->map(fn (Level $level): array => [
                    'code' => $level->code->value,
                    'label' => $level->code->label(),
                    'modules' => $level->is($selectedLevel)
                        ? $this->modulesOfLevel($user, $level)
                        : [],
                ])
                ->all(),
            'selectedLevel' => $selectedLevel?->code->value,
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

        $moduleIndex = array_search($module->slug, array_column($modules, 'id'), true);
        $lessonData = $modules[$moduleIndex]['lessons'] ?? [];
        $lessonIndex = array_search($lesson->slug, array_column($lessonData, 'id'), true);

        $progress = LessonProgress::query()
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        return Inertia::render('learner/learn/show', [
            'level' => $level->code->value,
            'module' => ['id' => $module->slug, 'title' => $module->name],
            'lesson' => [
                'id' => $lesson->slug,
                'title' => $lesson->title,
                'introduction' => $lesson->description ?? '',
            ],
            'moduleNumber' => $moduleIndex === false ? 1 : $moduleIndex + 1,
            'lessonNumber' => $lessonIndex === false ? 1 : $lessonIndex + 1,
            'mdx' => $lesson->content,
            'questions' => $this->publicQuestions($module, $lesson),
            'modules' => $modules,
            'isRead' => (bool) $progress?->is_read,
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

        $questions = $this->quizOf($module, $lesson);
        abort_if($questions === [], 404);

        $rules = [];
        foreach ($questions as $key => $question) {
            $rules["answers.{$key}"] = ['required', Rule::in(array_keys($question['options']))];
        }
        $answers = $request->validate($rules)['answers'];

        $corrections = [];
        $score = 0;

        foreach ($questions as $key => $question) {
            $selected = $answers[$key];
            $isCorrect = $selected === $question['correct'];

            if ($isCorrect) {
                $score++;
            }

            $corrections[$key] = [
                'selected' => $selected,
                'correct' => $question['correct'],
                'explanation' => $question['explanation'],
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
            ->route('learner.learn.lesson.show', [$module->slug, $lesson->slug])
            ->with('quizResult', [
                'score' => $score,
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
     * Les modules actifs d'un niveau, avec leurs leçons et la progression
     * de l'apprenant : c'est la forme de données des pages étudiantes.
     *
     * @return array<int, array{id: string, title: string, lessons: array<int, array{id: string, title: string, category: string, available: boolean, read: boolean, bestScore: int|null, quizLength: int|null}>}>
     */
    private function modulesOfLevel(?User $user, Level $level): array
    {
        $modules = Module::query()
            ->where('is_active', true)
            ->where('level_id', $level->id)
            ->ordered()
            ->with(['lessons' => fn ($query) => $query->ordered()])
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
                    $quiz = $this->quizOf($module, $lesson);

                    return [
                        'id' => $lesson->slug,
                        'title' => $lesson->title,
                        'category' => $lesson->description ?? $module->name,
                        'available' => $lesson->is_active,
                        'read' => (bool) $progress?->is_read,
                        'bestScore' => $progress?->best_score,
                        'quizLength' => $quiz === [] ? null : count($quiz),
                    ];
                })->all(),
            ];
        })->all();
    }

    /**
     * Questions du quiz de la leçon (aucun = pas d'onglet Quiz côté étudiant).
     * Les réponses et explications ne partent jamais vers le front.
     *
     * @return array<string, array{prompt: string, options: array<string, string>, correct: string, explanation: string}>
     */
    private function quizOf(Module $module, Lesson $lesson): array
    {
        if ($lesson->slug !== 'alphabet') {
            return [];
        }

        return [
            'vowels' => [
                'prompt' => 'Quelles sont les cinq voyelles de l’alphabet allemand ?',
                'options' => [
                    'a' => 'A, E, I, O, U',
                    'b' => 'A, E, Y, O, Ü',
                    'c' => 'A, Ä, I, O, Ü',
                ],
                'correct' => 'a',
                'explanation' => 'L’allemand compte cinq voyelles : A, E, I, O, U (auxquelles s’ajoutent Ä, Ö, Ü).',
            ],
            'pronunciation-c' => [
                'prompt' => 'Comment se prononce la lettre C en allemand ?',
                'options' => [
                    'a' => 'tsé',
                    'b' => 'tsets',
                    'c' => 'sé',
                ],
                'correct' => 'b',
                'explanation' => 'C se prononce « tsets » (comme dans Celle).',
            ],
            'name-w' => [
                'prompt' => 'Comment s’appelle la lettre W ?',
                'options' => [
                    'a' => 'vé',
                    'b' => 'double-vé',
                    'c' => 'doux-vé',
                ],
                'correct' => 'b',
                'explanation' => 'W se dit « double-vé » (W au début d’un mot, V au milieu : Wein, Frau).',
            ],
            'order' => [
                'prompt' => 'Quelle lettre suit le B dans l’alphabet ?',
                'options' => [
                    'a' => 'D',
                    'b' => 'E',
                    'c' => 'C',
                ],
                'correct' => 'c',
                'explanation' => 'L’alphabet suit l’ordre classique : A, B, C, D…',
            ],
        ];
    }

    /**
     * Version publique des questions (sans correct/explanation).
     *
     * @return array<string, array{prompt: string, options: array<string, string>}>
     */
    private function publicQuestions(Module $module, Lesson $lesson): array
    {
        return collect($this->quizOf($module, $lesson))
            ->map(fn (array $question): array => [
                'prompt' => $question['prompt'],
                'options' => $question['options'],
            ])
            ->all();
    }
}
