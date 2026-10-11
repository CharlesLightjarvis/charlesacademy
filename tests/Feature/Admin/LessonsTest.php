<?php

use App\Enums\RoleEnum;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function lessonAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    return $user;
}

test('only admins with manage-content can access the lesson forms', function () {
    $module = Module::factory()->create();

    $this->get(route('admin.modules.lessons.create', $module))
        ->assertRedirect(route('login'));

    $learner = User::factory()->create();
    $learner->assignRole(RoleEnum::Learner->value);
    $this->actingAs($learner)
        ->get(route('admin.modules.lessons.create', $module))
        ->assertForbidden();

    $this->actingAs(lessonAdmin())
        ->get(route('admin.modules.lessons.create', $module))
        ->assertOk();
});

test('the module edit page only lists the lessons of that module', function () {
    $module = Module::factory()->create();
    $other = Module::factory()->create();

    $module->lessons()->create(['title' => 'Première leçon']);
    $other->lessons()->create(['title' => "Leçon d'un autre module"]);

    $this->actingAs(lessonAdmin())
        ->get(route('admin.modules.edit', $module))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/modules/edit')
            ->has('lessons', 1)
            ->where('lessons.0.title', 'Première leçon'));
});

test('a draft lesson can be created without content', function () {
    $module = Module::factory()->create();

    $this->actingAs(lessonAdmin())
        ->post(route('admin.modules.lessons.store', $module), [
            'title' => 'Salutations',
            'description' => 'Dire bonjour en allemand.',
        ])
        ->assertRedirect(route('admin.modules.edit', ['module' => $module, 'tab' => 'lecons']));

    $lesson = Lesson::query()->firstOrFail();

    expect($lesson->module_id)->toBe($module->id);
    expect($lesson->slug)->toBe('salutations');
    expect($lesson->content)->toBeNull();
    expect($lesson->is_active)->toBeFalse();
    expect($lesson->order_column)->toBe(1);

    // Titre manquant : rejeté.
    $this->post(route('admin.modules.lessons.store', $module), [])
        ->assertSessionHasErrors('title');
});

test('publishing a lesson requires its content', function () {
    $module = Module::factory()->create();

    $this->actingAs(lessonAdmin())
        ->post(route('admin.modules.lessons.store', $module), [
            'title' => 'Publiée sans contenu',
            'is_active' => '1',
        ])
        ->assertSessionHasErrors('content');

    $this->actingAs(lessonAdmin())
        ->post(route('admin.modules.lessons.store', $module), [
            'title' => 'Publiée',
            'content' => "# Bonjour\n\nHallo !",
            'is_active' => '1',
        ])
        ->assertRedirect(route('admin.modules.edit', ['module' => $module, 'tab' => 'lecons']));

    expect(Lesson::query()->count())->toBe(1);
});

test('lesson slugs are unique inside their module only', function () {
    $module = Module::factory()->create();
    $other = Module::factory()->create();

    $module->lessons()->create(['title' => 'Introduction']);
    $module->lessons()->create(['title' => 'Introduction']);
    $other->lessons()->create(['title' => 'Introduction']);

    $slugs = $module->lessons()->pluck('slug');

    expect($slugs)->toHaveCount(2);
    expect($slugs->unique())->toHaveCount(2);
    expect($other->lessons()->firstOrFail()->slug)->toBe('introduction');
});

test('an admin updates a lesson without changing its slug', function () {
    $module = Module::factory()->create();
    $lesson = $module->lessons()->create([
        'title' => 'Grammaire',
        'content' => '# Grammaire',
        'is_active' => true,
    ]);

    $this->actingAs(lessonAdmin())
        ->put(route('admin.modules.lessons.update', [$module, $lesson]), [
            'title' => 'Grammaire allemande',
            'description' => 'Les cas, sans peur.',
            'content' => '# Cas',
            'is_active' => '0',
        ])
        ->assertRedirect(route('admin.modules.edit', ['module' => $module, 'tab' => 'lecons']));

    $lesson->refresh();

    expect($lesson->title)->toBe('Grammaire allemande');
    expect($lesson->slug)->toBe('grammaire');
    expect($lesson->is_active)->toBeFalse();
});

test('an admin deletes a lesson', function () {
    $module = Module::factory()->create();
    $lesson = $module->lessons()->create(['title' => 'À virer']);

    $this->actingAs(lessonAdmin())
        ->delete(route('admin.modules.lessons.destroy', [$module, $lesson]))
        ->assertRedirect(route('admin.modules.edit', ['module' => $module, 'tab' => 'lecons']));

    expect(Lesson::query()->count())->toBe(0);
});

test('lessons are ordered inside their module after a drag and drop', function () {
    $module = Module::factory()->create();
    $other = Module::factory()->create();

    $first = $module->lessons()->create(['title' => 'Premier']);
    $second = $module->lessons()->create(['title' => 'Deuxième']);
    $third = $module->lessons()->create(['title' => 'Troisième']);
    $foreign = $other->lessons()->create(['title' => "Leçon d'ailleurs"]);

    $this->actingAs(lessonAdmin())
        ->patch(route('admin.modules.lessons.reorder', $module), [
            'ids' => [$third->id, $first->id, $second->id],
        ])
        ->assertRedirect();

    expect($third->fresh()->order_column)->toBe(1);
    expect($first->fresh()->order_column)->toBe(2);
    expect($second->fresh()->order_column)->toBe(3);
    expect($foreign->fresh()->order_column)->toBe(1);

    // Une leçon d'un autre module est refusée.
    $this->patch(route('admin.modules.lessons.reorder', $module), [
        'ids' => [$foreign->id],
    ])->assertSessionHasErrors('ids.0');
});

test('a lesson cannot be reached through another module', function () {
    $module = Module::factory()->create();
    $other = Module::factory()->create();
    $foreign = $other->lessons()->create(['title' => 'Protégée', 'content' => '# Protégée']);

    $this->actingAs(lessonAdmin())
        ->put(route('admin.modules.lessons.update', [$module, $foreign]), [
            'title' => 'Piratée',
            'content' => '# Piratée',
        ])
        ->assertNotFound();

    $this->actingAs(lessonAdmin())
        ->delete(route('admin.modules.lessons.destroy', [$module, $foreign]))
        ->assertNotFound();

    expect($foreign->fresh()->title)->toBe('Protégée');
});

test('deleting a module deletes its lessons', function () {
    $module = Module::factory()->create();
    $module->lessons()->create(['title' => 'Orpheline']);

    $this->actingAs(lessonAdmin())
        ->delete(route('admin.modules.destroy', $module))
        ->assertRedirect(route('admin.modules.index'));

    expect(Lesson::query()->count())->toBe(0);
});
