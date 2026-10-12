<?php

use App\Enums\RoleEnum;
use App\Models\Level;
use App\Models\Module;
use App\Models\User;
use Database\Seeders\LevelSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(LevelSeeder::class);
});

function admin(): User
{
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    return $user;
}

test('only admins with manage-content can access the modules admin area', function () {
    $this->get(route('admin.modules.index'))->assertRedirect(route('login'));

    $learner = User::factory()->create();
    $learner->assignRole(RoleEnum::Learner->value);
    $this->actingAs($learner)->get(route('admin.modules.index'))->assertForbidden();

    $this->actingAs(admin())->get(route('admin.modules.index'))->assertOk();
});

test('an admin sees the modules ordered by the automatic order column', function () {
    Module::factory()->create(['name' => 'Grammaire']);
    Module::factory()->create(['name' => 'Vocabulaire']);

    $this->actingAs(admin())
        ->get(route('admin.modules.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/modules/index')
            ->has('modules', 2)
            ->where('modules.0.name', 'Grammaire')
            ->where('modules.0.slug', 'grammaire'));
});

test('a module gets a slug and an order automatically', function () {
    Module::factory()->create(['name' => 'Les bases']);

    $module = Module::query()->firstOrFail();

    expect($module->slug)->toBe('les-bases');
    expect($module->order_column)->toBe(1);

    Module::factory()->create(['name' => 'Conversation']);

    expect(Module::query()->ordered()->get()->last()->order_column)->toBe(2);
});

test('duplicate names receive unique slugs', function () {
    Module::factory()->create(['name' => 'Grammaire']);
    Module::factory()->create(['name' => 'Grammaire']);

    $slugs = Module::query()->pluck('slug');

    expect($slugs)->toHaveCount(2);
    expect($slugs->first())->not->toBe($slugs->last());
});

test('an admin creates a module', function () {
    $this->actingAs(admin())
        ->post(route('admin.modules.store'), [
            'name' => 'Alphabet',
            'level_id' => Level::query()->firstOrFail()->id,
            'description' => 'Lecture et écriture.',
            'is_active' => '1',
        ])
        ->assertRedirect(route('admin.modules.edit', ['module' => Module::query()->firstOrFail(), 'tab' => 'lecons']));

    $module = Module::query()->firstOrFail();

    expect($module->name)->toBe('Alphabet');
    expect($module->slug)->toBe('alphabet');
    expect($module->description)->toBe('Lecture et écriture.');
    expect($module->is_active)->toBeTrue();
    expect($module->order_column)->toBe(1);

    // Nom manquant : rejeté.
    $this->post(route('admin.modules.store'), [])
        ->assertSessionHasErrors('name');
});

test('an admin updates a module without changing its slug', function () {
    $module = Module::factory()->create(['name' => 'Grammaire']);

    $this->actingAs(admin())
        ->put(route('admin.modules.update', $module), [
            'name' => 'Grammaire avancée',
            'level_id' => $module->level_id,
            'description' => 'Nouveau contenu.',
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.modules.edit', ['module' => $module, 'tab' => 'infos']));

    $module->refresh();

    expect($module->name)->toBe('Grammaire avancée');
    expect($module->slug)->toBe('grammaire');
    expect($module->is_active)->toBeFalse();
});

test('an admin deletes a module', function () {
    $module = Module::factory()->create();

    $this->actingAs(admin())
        ->delete(route('admin.modules.destroy', $module))
        ->assertRedirect(route('admin.modules.index'));

    expect(Module::query()->count())->toBe(0);
});

test('an admin can reorder the modules after a drag and drop', function () {
    $first = Module::factory()->create(['name' => 'Premier']);
    $second = Module::factory()->create(['name' => 'Deuxième']);
    $third = Module::factory()->create(['name' => 'Troisième']);

    $this->actingAs(admin())
        ->patch(route('admin.modules.reorder'), [
            'ids' => [$third->id, $first->id, $second->id],
        ])
        ->assertRedirect();

    expect($third->fresh()->order_column)->toBe(1);
    expect($first->fresh()->order_column)->toBe(2);
    expect($second->fresh()->order_column)->toBe(3);

    // Un id inconnu est rejeté.
    $this->patch(route('admin.modules.reorder'), ['ids' => [$first->id, 999999]])
        ->assertSessionHasErrors('ids.1');
});

test('a learner cannot create a module', function () {
    $learner = User::factory()->create();
    $learner->assignRole(RoleEnum::Learner->value);

    $this->actingAs($learner)
        ->post(route('admin.modules.store'), ['name' => 'Interdit'])
        ->assertForbidden();

    expect(Module::query()->count())->toBe(0);
});
