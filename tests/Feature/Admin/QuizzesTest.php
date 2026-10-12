<?php

use App\Enums\RoleEnum;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(fn () => $this->seed(RolesAndPermissionsSeeder::class));

function quizAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    return $user;
}

/**
 * @return array{0: Module, 1: Lesson}
 */
function quizModuleWithLesson(): array
{
    $module = Module::factory()->create();
    $lesson = $module->lessons()->create(['title' => 'Introduction', 'is_active' => true]);

    return [$module, $lesson];
}

test('only admins with manage-content can access the quiz admin area', function () {
    [$module, $lesson] = quizModuleWithLesson();

    $this->get(route('admin.modules.lessons.quiz.edit', [$module, $lesson]))
        ->assertRedirect(route('login'));

    $learner = User::factory()->create();
    $learner->assignRole(RoleEnum::Learner->value);

    $this->actingAs($learner)
        ->post(route('admin.modules.lessons.quiz.store', [$module, $lesson]), ['title' => 'Quiz'])
        ->assertForbidden();

    $this->actingAs(quizAdmin())
        ->get(route('admin.modules.lessons.quiz.edit', [$module, $lesson]))
        ->assertOk();
});

use Inertia\Testing\AssertableInertia as Assert;

test('the quiz page shows the creation form or the quiz with its questions', function () {
    [$module, $lesson] = quizModuleWithLesson();

    $this->actingAs(quizAdmin())
        ->get(route('admin.modules.lessons.quiz.edit', [$module, $lesson]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/modules/lessons/quiz')
            ->where('quiz', null)
            ->has('questions', 0));

    $quiz = $lesson->quiz()->create(['title' => 'Le quiz']);
    $quiz->questions()->create([
        'prompt' => 'Une question ?',
        'options' => ['a' => 'Oui', 'b' => 'Non', 'c' => 'Peut-être'],
        'correct_option' => 'a',
    ]);

    $this->actingAs(quizAdmin())
        ->get(route('admin.modules.lessons.quiz.edit', [$module, $lesson]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/modules/lessons/quiz')
            ->where('quiz.title', 'Le quiz')
            ->has('questions', 1)
            ->where('questions.0.prompt', 'Une question ?')
            ->where('questions.0.correct_option', 'a'));
});

test('a lesson of another module cannot be reached through this module', function () {
    [, $lesson] = quizModuleWithLesson();
    [$otherModule] = quizModuleWithLesson();

    $this->actingAs(quizAdmin())
        ->get(route('admin.modules.lessons.quiz.edit', [$otherModule, $lesson]))
        ->assertNotFound();
});

test('an admin creates the quiz of a lesson', function () {
    [$module, $lesson] = quizModuleWithLesson();

    $this->actingAs(quizAdmin())
        ->post(route('admin.modules.lessons.quiz.store', [$module, $lesson]), [
            'title' => 'Quiz de la leçon',
        ])
        ->assertRedirect(route('admin.modules.lessons.quiz.edit', [$module, $lesson]));

    expect(Quiz::query()->where('lesson_id', $lesson->id)->count())->toBe(1);
    expect($lesson->quiz()->first()->title)->toBe('Quiz de la leçon');

    // Un second quiz pour la même leçon est refusé (unicité).
    $this->actingAs(quizAdmin())
        ->post(route('admin.modules.lessons.quiz.store', [$module, $lesson]), [
            'title' => 'Encore un',
        ])
        ->assertStatus(409);
});

test('an admin updates the quiz settings', function () {
    [$module, $lesson] = quizModuleWithLesson();
    $quiz = $lesson->quiz()->create(['title' => 'Avant', 'is_active' => true]);

    $this->actingAs(quizAdmin())
        ->put(route('admin.modules.lessons.quiz.update', [$module, $lesson]), [
            'title' => 'Après',
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.modules.lessons.quiz.edit', [$module, $lesson]));

    expect($quiz->fresh()->title)->toBe('Après');
    expect($quiz->fresh()->is_active)->toBeFalse();
});

test('an admin adds, updates, reorders and deletes questions', function () {
    [$module, $lesson] = quizModuleWithLesson();
    $quiz = $lesson->quiz()->create(['title' => 'Quiz']);

    // Ajout.
    $this->actingAs(quizAdmin())
        ->post(route('admin.modules.lessons.quiz.questions.store', [$module, $lesson]), [
            'prompt' => 'Première question ?',
            'options' => ['a' => 'Oui', 'b' => 'Non', 'c' => 'Peut-être'],
            'correct_option' => 'a',
            'explanation' => 'Parce que.',
        ])
        ->assertRedirect(route('admin.modules.lessons.quiz.edit', [$module, $lesson]));

    $first = $quiz->questions()->orderBy('order_column')->first();
    expect($first->prompt)->toBe('Première question ?');
    expect($first->options)->toBe(['a' => 'Oui', 'b' => 'Non', 'c' => 'Peut-être']);

    $second = $quiz->questions()->create([
        'prompt' => 'Deuxième question ?',
        'options' => ['a' => '1', 'b' => '2', 'c' => '3'],
        'correct_option' => 'c',
    ]);
    $third = $quiz->questions()->create([
        'prompt' => 'Troisième question ?',
        'options' => ['a' => '1', 'b' => '2', 'c' => '3'],
        'correct_option' => 'b',
    ]);

    // Modification.
    $this->actingAs(quizAdmin())
        ->put(route('admin.modules.lessons.quiz.questions.update', [$module, $lesson, $first]), [
            'prompt' => 'Question modifiée ?',
            'options' => ['a' => 'Oui', 'b' => 'Non', 'c' => 'Peut-être'],
            'correct_option' => 'b',
        ])
        ->assertRedirect();

    expect($first->fresh()->prompt)->toBe('Question modifiée ?');
    expect($first->fresh()->correct_option)->toBe('b');

    // Réordonner : le troisième passe en premier.
    $this->actingAs(quizAdmin())
        ->patch(route('admin.modules.lessons.quiz.questions.reorder', [$module, $lesson]), [
            'ids' => [$third->id, $first->id, $second->id],
        ])
        ->assertRedirect();

    expect($third->fresh()->order_column)->toBe(1);
    expect($first->fresh()->order_column)->toBe(2);
    expect($second->fresh()->order_column)->toBe(3);

    // Suppression.
    $this->actingAs(quizAdmin())
        ->delete(route('admin.modules.lessons.quiz.questions.destroy', [$module, $lesson, $second]))
        ->assertRedirect();

    expect(QuizQuestion::query()->find($second->id))->toBeNull();
});

test('questions are validated', function () {
    [$module, $lesson] = quizModuleWithLesson();
    $lesson->quiz()->create(['title' => 'Quiz']);

    $this->actingAs(quizAdmin())
        ->post(route('admin.modules.lessons.quiz.questions.store', [$module, $lesson]), [])
        ->assertSessionHasErrors(['prompt', 'options', 'options.a', 'options.b', 'options.c', 'correct_option']);

    $this->actingAs(quizAdmin())
        ->post(route('admin.modules.lessons.quiz.questions.store', [$module, $lesson]), [
            'prompt' => 'Question ?',
            'options' => ['a' => '1', 'b' => '2', 'c' => '3'],
            'correct_option' => 'z',
        ])
        ->assertSessionHasErrors('correct_option');
});

test('a question of another quiz cannot be reached through this one', function () {
    [$module, $lesson] = quizModuleWithLesson();
    $lesson->quiz()->create(['title' => 'Quiz']);

    [$otherModule, $otherLesson] = quizModuleWithLesson();
    $otherQuiz = $otherLesson->quiz()->create(['title' => 'Autre quiz']);
    $foreignQuestion = $otherQuiz->questions()->create([
        'prompt' => 'Ailleurs ?',
        'options' => ['a' => '1', 'b' => '2', 'c' => '3'],
        'correct_option' => 'a',
    ]);

    $this->actingAs(quizAdmin())
        ->put(route('admin.modules.lessons.quiz.questions.update', [$module, $lesson, $foreignQuestion]), [
            'prompt' => 'Hack ?',
            'options' => ['a' => '1', 'b' => '2', 'c' => '3'],
            'correct_option' => 'a',
        ])
        ->assertNotFound();

    $this->actingAs(quizAdmin())
        ->delete(route('admin.modules.lessons.quiz.questions.destroy', [$module, $lesson, $foreignQuestion]))
        ->assertNotFound();

    expect($foreignQuestion->fresh()->prompt)->toBe('Ailleurs ?');
    expect($otherModule->id)->not->toBe($module->id);
});
