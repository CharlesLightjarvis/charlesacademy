<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home/index')->name('home');
Route::inertia('/courses', 'home/courses/index')->name('courses.index');
Route::inertia('/placement-test', 'home/courses/placement-test')->name('courses.placement-test');
Route::inertia('/resources', 'home/resources/index')
    ->name('resources.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
