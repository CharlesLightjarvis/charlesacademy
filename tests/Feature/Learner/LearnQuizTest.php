<?php

use App\Enums\RoleEnum;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\QuizQuestion;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(fn () => $this->seed(RolesAndPermissionsSeeder::class));

function learnQuizLearner(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Learner->value);

    return $user;
}

/**
 * Un module publié, une leçon publiée, son quiz actif et une question.
 *
 * @return array{0: Module, 1: Lesson, 2: QuizQuestion}
 */
function learnQuizSetup(): array
{
    $module = Module::factory()->create(['is_active' => true]);
    $lesson = $module->lessons()->create(['title' => 'Introduction', 'is_active' => true]);
    $quiz = $lesson->quiz()->create(['title' => 'Quiz', 'is_active' => true]);
    $question = $quiz->questions()->create([
        'prompt' => 'Comment dit-on bonjour ?',
        'options' => ['a' => 'Hello', 'b' => 'Goodbye', 'c' => 'Thanks'],
        'correct_option' => 'a',
        'explanation' => '« Hello » veut dire bonjour.',
    ]);

    return [$module, $lesson, $question];
}

test('a wrong answer is corrected right away', function () {
    [$module, $lesson, $question] = learnQuizSetup();

    $this->actingAs(learnQuizLearner())
        ->postJson(route('learner.learn.lesson.quiz.validate', [$module->slug, $lesson->slug]), [
            'question_id' => $question->id,
            'answer' => 'b',
        ])
        ->assertOk()
        ->assertJson([
            'selected' => 'b',
            'correct' => 'a',
            'is_correct' => false,
            'explanation' => '« Hello » veut dire bonjour.',
        ]);
});

test('a right answer is confirmed right away', function () {
    [$module, $lesson, $question] = learnQuizSetup();

    $this->actingAs(learnQuizLearner())
        ->postJson(route('learner.learn.lesson.quiz.validate', [$module->slug, $lesson->slug]), [
            'question_id' => $question->id,
            'answer' => 'a',
        ])
        ->assertOk()
        ->assertJson([
            'selected' => 'a',
            'correct' => 'a',
            'is_correct' => true,
        ]);
});

test('an answer that does not exist is refused', function () {
    [$module, $lesson, $question] = learnQuizSetup();

    $this->actingAs(learnQuizLearner())
        ->postJson(route('learner.learn.lesson.quiz.validate', [$module->slug, $lesson->slug]), [
            'question_id' => $question->id,
            'answer' => 'z',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('answer');
});

test('a question of another quiz cannot be corrected through this lesson', function () {
    [$module, $lesson] = learnQuizSetup();

    $otherModule = Module::factory()->create(['is_active' => true]);
    $otherLesson = $otherModule->lessons()->create(['title' => 'Salutations', 'is_active' => true]);
    $foreignQuestion = $otherLesson->quiz()->create(['title' => 'Autre quiz', 'is_active' => true])
        ->questions()->create([
            'prompt' => 'Ailleurs ?',
            'options' => ['a' => 'Oui', 'b' => 'Non'],
            'correct_option' => 'a',
        ]);

    $this->actingAs(learnQuizLearner())
        ->postJson(route('learner.learn.lesson.quiz.validate', [$module->slug, $lesson->slug]), [
            'question_id' => $foreignQuestion->id,
            'answer' => 'a',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('question_id');
});
