<?php

namespace App\Actions\Learner;

use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SubmitLessonQuiz
{
    /**
     * @param  array<string, mixed>  $input
     * @return array{score: int, total: int, bestScore: int, corrections: array<int, array{selected: string, correct: string, explanation: string|null, is_correct: bool}>}
     */
    public function handle(User $user, Lesson $lesson, Quiz $quiz, array $input): array
    {
        $questions = $quiz->questions;
        $rules = [
            'answers' => ['required', 'array:'.$questions->pluck('id')->implode(',')],
        ];

        foreach ($questions as $question) {
            $rules["answers.{$question->id}"] = ['required', Rule::in(array_keys($question->options))];
        }

        $answers = validator($input, $rules)->validate()['answers'];
        $corrections = [];
        $score = 0;

        foreach ($questions as $question) {
            $selected = $answers[$question->id];
            $isCorrect = $selected === $question->correct_option;
            $score += (int) $isCorrect;

            $corrections[$question->id] = [
                'selected' => $selected,
                'correct' => $question->correct_option,
                'explanation' => $question->explanation,
                'is_correct' => $isCorrect,
            ];
        }

        $bestScore = DB::transaction(function () use ($user, $lesson, $score): int {
            LessonProgress::query()->firstOrCreate([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ]);

            $progress = LessonProgress::query()
                ->where('user_id', $user->id)
                ->where('lesson_id', $lesson->id)
                ->lockForUpdate()
                ->firstOrFail();

            $progress->score = $score;
            $progress->best_score = max($progress->best_score ?? 0, $score);
            $progress->completed_at = now();
            $progress->save();

            return $progress->best_score;
        });

        return [
            'score' => $score,
            'total' => $questions->count(),
            'bestScore' => $bestScore,
            'corrections' => $corrections,
        ];
    }
}
