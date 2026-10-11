<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\UsersSeeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('learners are directed to their dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Learner->value);
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertRedirect(route('learner.dashboard'));
    $this->get(route('learner.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('learner/dashboard')
            ->where('auth.permissions', fn (Collection $permissions): bool => $permissions->contains(PermissionEnum::ViewLearnerDashboard->value)
                && ! $permissions->contains(PermissionEnum::ViewAdminDashboard->value)));
});

test('admins are directed to their dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Admin->value);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('auth.permissions', fn (Collection $permissions): bool => $permissions->contains(PermissionEnum::ViewAdminDashboard->value)
                && ! $permissions->contains(PermissionEnum::ViewLearnerDashboard->value)));
});

test('users without a role are denied access to the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('learners cannot open the admin dashboard even with its permission', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Learner->value);
    $user->givePermissionTo(PermissionEnum::ViewAdminDashboard->value);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('a dashboard permission is required even with the matching role', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::Learner->value);
    $role = $user->roles()->firstOrFail();
    $role->revokePermissionTo(PermissionEnum::ViewLearnerDashboard->value);

    $this->actingAs($user)
        ->get(route('learner.dashboard'))
        ->assertForbidden();
});

test('seeded users receive permissions through their roles', function () {
    $this->seed(UsersSeeder::class);

    $admin = User::query()->where('email', 'admin@charlesacademy.test')->firstOrFail();
    $learner = User::query()->where('email', 'learner@charlesacademy.test')->firstOrFail();

    expect(Str::isUuid($admin->id))->toBeTrue();
    expect($admin->hasRole(RoleEnum::Admin->value))->toBeTrue();
    expect($admin->can(PermissionEnum::ManageUsers->value))->toBeTrue();
    expect($admin->can(PermissionEnum::ViewAdminDashboard->value))->toBeTrue();
    expect($admin->can(PermissionEnum::ViewLearnerDashboard->value))->toBeFalse();
    expect($learner->hasRole(RoleEnum::Learner->value))->toBeTrue();
    expect($learner->can(PermissionEnum::ViewLearnerDashboard->value))->toBeTrue();
    expect($learner->can(PermissionEnum::PracticeGrammar->value))->toBeTrue();
    expect($learner->can(PermissionEnum::ManageUsers->value))->toBeFalse();
});
