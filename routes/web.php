<?php

use App\Enums\RoleEnum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');
Route::inertia('/courses', 'home/courses/index')->name('courses.index');
Route::inertia('/placement-test', 'home/courses/placement-test')->name('courses.placement-test');
Route::inertia('/resources', 'home/resources/index')
    ->name('resources.index');

Route::get('dashboard', function (Request $request): RedirectResponse {
    $user = $request->user();

    if ($user->hasRole(RoleEnum::Admin->value)) {
        return redirect()->route('admin.dashboard');
    }

    if ($user->hasRole(RoleEnum::Learner->value)) {
        return redirect()->route('learner.dashboard');
    }

    abort(403);
})->middleware('auth')->name('dashboard');

require __DIR__.'/admin.php';
require __DIR__.'/learner.php';

require __DIR__.'/settings.php';
