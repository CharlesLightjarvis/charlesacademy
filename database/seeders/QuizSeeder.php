<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class QuizSeeder extends Seeder
{
    /**
     * One small quiz per published lesson.
     *
     * The alphabet lesson gets the real questions (the ones that used to be
     * hard-coded in LearnController); every other published lesson gets a
     * light demo quiz so the student flow can be played with.
     */
    public function run(): void
    {
        $this->alphabetQuiz();

        Lesson::query()
            ->where('is_active', true)
            ->where('slug', '!=', 'alphabet')
            ->with('module.lessons')
            ->get()
            ->each(fn (Lesson $lesson) => $this->demoQuiz($lesson));
    }

    /**
     * The real alphabet quiz, seeded on the "alphabet" lesson when it exists.
     */
    private function alphabetQuiz(): void
    {
        $lesson = Lesson::query()->where('slug', 'alphabet')->first();

        if ($lesson === null) {
            return;
        }

        $quiz = $lesson->quiz()->firstOrCreate([], ['title' => 'L’alphabet allemand']);

        if ($quiz->questions()->exists()) {
            return;
        }

        $questions = [
            [
                'prompt' => 'Quelles sont les cinq voyelles de l’alphabet allemand ?',
                'options' => [
                    'a' => 'A, E, I, O, U',
                    'b' => 'A, E, Y, O, Ü',
                    'c' => 'A, Ä, I, O, Ü',
                ],
                'correct_option' => 'a',
                'explanation' => 'L’allemand compte cinq voyelles : A, E, I, O, U (auxquelles s’ajoutent Ä, Ö, Ü).',
            ],
            [
                'prompt' => 'Comment se prononce la lettre C en allemand ?',
                'options' => [
                    'a' => 'tsé',
                    'b' => 'tsets',
                    'c' => 'sé',
                ],
                'correct_option' => 'b',
                'explanation' => 'C se prononce « tsets » (comme dans Celle).',
            ],
            [
                'prompt' => 'Comment s’appelle la lettre W ?',
                'options' => [
                    'a' => 'vé',
                    'b' => 'double-vé',
                    'c' => 'doux-vé',
                ],
                'correct_option' => 'b',
                'explanation' => 'W se dit « double-vé » (W au début d’un mot, V au milieu : Wein, Frau).',
            ],
            [
                'prompt' => 'Quelle lettre suit le B dans l’alphabet ?',
                'options' => [
                    'a' => 'D',
                    'b' => 'E',
                    'c' => 'C',
                ],
                'correct_option' => 'c',
                'explanation' => 'L’alphabet suit l’ordre classique : A, B, C, D…',
            ],
        ];

        foreach ($questions as $index => $question) {
            $quiz->questions()->create([...$question, 'order_column' => $index + 1]);
        }
    }

    /**
     * A two-question demo quiz, referencing the module and lesson itself,
     * so every published lesson can exercise the quiz page.
     */
    private function demoQuiz(Lesson $lesson): void
    {
        $quiz = $lesson->quiz()->firstOrCreate([], ['title' => 'Vérifie ce que tu as retenu']);

        if ($quiz->questions()->exists()) {
            return;
        }

        $moduleOptions = $this->optionsWith($lesson->module->name, Module::query()
            ->where('id', '!=', $lesson->module_id)
            ->limit(2)
            ->pluck('name'));

        $quiz->questions()->create([
            'prompt' => 'Dans quel module se trouve cette leçon ?',
            'options' => $moduleOptions,
            'correct_option' => array_search($lesson->module->name, $moduleOptions, true),
            'order_column' => 1,
        ]);

        $lessonOptions = $this->optionsWith($lesson->title, $lesson->module->lessons
            ->where('id', '!=', $lesson->id)
            ->pluck('title')
            ->take(2));

        $quiz->questions()->create([
            'prompt' => 'Quel est le titre de cette leçon ?',
            'options' => $lessonOptions,
            'correct_option' => array_search($lesson->title, $lessonOptions, true),
            'order_column' => 2,
        ]);
    }

    /**
     * The correct answer mixed with distractors, keyed a/b/c in random order.
     *
     * @param  Collection<int, mixed>  $distractors
     * @return array<string, string>
     */
    private function optionsWith(string $answer, Collection $distractors): array
    {
        $labels = ['a', 'b', 'c'];

        $options = collect([$answer])
            ->merge($distractors->filter(fn ($distractor) => is_string($distractor))->values())
            ->unique()
            ->pipe(fn (Collection $options) => $options->count() < 3
                ? $options->merge(['Pas encore appris', 'Aucune idée'])->unique()
                : $options)
            ->take(3)
            ->values()
            ->shuffle()
            ->values();

        return $options->mapWithKeys(fn (string $label, int $index) => [$labels[$index] => $label])->all();
    }
}
