<?php

use App\Enums\RoleEnum;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\QuizQuestion;
use App\Models\User;
use Database\Seeders\LevelSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(LevelSeeder::class);
});

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

test('the lesson page shows the active quiz length without exposing answers', function () {
    [$module, $lesson] = learnQuizSetup();

    $this->actingAs(learnQuizLearner())
        ->get(route('learner.learn.lesson.show', [$module->slug, $lesson->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('learner/learn/show')
            ->where('quiz.length', 1)
            ->where('quiz.title', 'Quiz')
            ->missing('quiz.questions'));
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

test('submitting answers records the score and preserves the best result', function () {
    [$module, $lesson, $question] = learnQuizSetup();
    $learner = learnQuizLearner();
    $submitUrl = route('learner.learn.lesson.quiz.submit', [$module->slug, $lesson->slug]);

    $this->actingAs($learner)
        ->post($submitUrl, ['answers' => [$question->id => 'a']])
        ->assertRedirect(route('learner.learn.lesson.quiz.show', [$module->slug, $lesson->slug]));

    $this->assertDatabaseHas('lesson_progress', [
        'user_id' => $learner->id,
        'lesson_id' => $lesson->id,
        'score' => 1,
        'best_score' => 1,
    ]);

    $this->get(route('learner.learn.lesson.quiz.show', [$module->slug, $lesson->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('learner/learn/quiz')
            ->hasFlash('quizResult.score', 1)
            ->hasFlash('quizResult.bestScore', 1));

    $this->post($submitUrl, ['answers' => [$question->id => 'b']])->assertRedirect();

    $this->assertDatabaseHas('lesson_progress', [
        'user_id' => $learner->id,
        'lesson_id' => $lesson->id,
        'score' => 0,
        'best_score' => 1,
    ]);
});

test('missing or foreign answers do not change the learner score', function () {
    [$module, $lesson, $question] = learnQuizSetup();
    $url = route('learner.learn.lesson.quiz.submit', [$module->slug, $lesson->slug]);

    $this->actingAs(learnQuizLearner())
        ->post($url, ['answers' => []])
        ->assertSessionHasErrors('answers');

    $this->post($url, ['answers' => [$question->id => 'z']])
        ->assertSessionHasErrors('answers.'.$question->id);

    $this->post($url, ['answers' => [$question->id => 'a', 999999 => 'a']])
        ->assertSessionHasErrors('answers');

    expect(LessonProgress::query()->count())->toBe(0);
});

test('a lesson cannot be read or changed through another module', function () {
    [$module] = learnQuizSetup();
    $otherModule = Module::factory()->create(['is_active' => true]);
    $foreignLesson = $otherModule->lessons()->create(['title' => 'Autre leçon', 'content' => '# Test', 'is_active' => true]);
    $parameters = [$module->slug, $foreignLesson->slug];
    $learner = learnQuizLearner();

    $this->actingAs($learner)
        ->get(route('learner.learn.lesson.show', $parameters))
        ->assertNotFound();

    $this->patch(route('learner.learn.lesson.read', $parameters))->assertNotFound();

    $this->get(route('learner.learn.lesson.quiz.show', $parameters))->assertNotFound();

    $this->postJson(route('learner.learn.lesson.quiz.validate', $parameters), [
        'question_id' => 1,
        'answer' => 'a',
    ])->assertNotFound();

    $this->post(route('learner.learn.lesson.quiz.submit', $parameters), [
        'answers' => [1 => 'a'],
    ])->assertNotFound();

    expect(LessonProgress::query()->count())->toBe(0);
});

test('an inactive quiz cannot be corrected or submitted', function () {
    [$module, $lesson, $question] = learnQuizSetup();
    $lesson->quiz()->update(['is_active' => false]);
    $parameters = [$module->slug, $lesson->slug];

    $this->actingAs(learnQuizLearner())
        ->postJson(route('learner.learn.lesson.quiz.validate', $parameters), [
            'question_id' => $question->id,
            'answer' => 'a',
        ])
        ->assertNotFound();

    $this->post(route('learner.learn.lesson.quiz.submit', $parameters), [
        'answers' => [$question->id => 'a'],
    ])->assertNotFound();
});

test('a learner can mark only an active lesson as read', function () {
    [$module, $lesson] = learnQuizSetup();
    $learner = learnQuizLearner();
    $url = route('learner.learn.lesson.read', [$module->slug, $lesson->slug]);

    $this->actingAs($learner)->patch($url)->assertRedirect();

    $this->assertDatabaseHas('lesson_progress', [
        'user_id' => $learner->id,
        'lesson_id' => $lesson->id,
        'is_read' => true,
    ]);

    $lesson->update(['is_active' => false]);
    $this->patch($url)->assertNotFound();
});

test('guests and users without the learner role cannot submit a quiz', function () {
    [$module, $lesson, $question] = learnQuizSetup();
    $url = route('learner.learn.lesson.quiz.submit', [$module->slug, $lesson->slug]);
    $answers = ['answers' => [$question->id => 'a']];

    $this->post($url, $answers)->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->post($url, $answers)->assertForbidden();

    expect(LessonProgress::query()->count())->toBe(0);
});

test('revoking the learner role blocks the quiz on the next request', function () {
    [$module, $lesson, $question] = learnQuizSetup();
    $learner = learnQuizLearner();
    $showUrl = route('learner.learn.lesson.quiz.show', [$module->slug, $lesson->slug]);
    $submitUrl = route('learner.learn.lesson.quiz.submit', [$module->slug, $lesson->slug]);

    $this->actingAs($learner)->get($showUrl)->assertOk();
    $learner->removeRole(RoleEnum::Learner->value);

    $this->get($showUrl)->assertForbidden();
    $this->post($submitUrl, ['answers' => [$question->id => 'a']])->assertForbidden();
    expect(LessonProgress::query()->count())->toBe(0);
});
