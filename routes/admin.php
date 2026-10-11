<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\ModuleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:'.RoleEnum::Admin->value])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::inertia('dashboard', 'admin/dashboard')
            ->middleware('can:'.PermissionEnum::ViewAdminDashboard->value)
            ->name('dashboard');

        Route::middleware('can:'.PermissionEnum::ManageContent->value)
            ->prefix('modules')
            ->name('modules.')
            ->group(function (): void {
                Route::get('/', [ModuleController::class, 'index'])->name('index');
                Route::get('/create', [ModuleController::class, 'create'])->name('create');
                Route::post('/', [ModuleController::class, 'store'])->name('store');
                Route::patch('/reorder', [ModuleController::class, 'reorder'])->name('reorder');
                Route::get('/{module}/edit', [ModuleController::class, 'edit'])->name('edit');
                Route::put('/{module}', [ModuleController::class, 'update'])->name('update');
                Route::delete('/{module}', [ModuleController::class, 'destroy'])->name('destroy');

                Route::get('/{module}/lessons/create', [LessonController::class, 'create'])->name('lessons.create');
                Route::post('/{module}/lessons', [LessonController::class, 'store'])->name('lessons.store');
                Route::patch('/{module}/lessons/reorder', [LessonController::class, 'reorder'])->name('lessons.reorder');
                Route::get('/{module}/lessons/{lesson}/edit', [LessonController::class, 'edit'])->name('lessons.edit');
                Route::put('/{module}/lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
                Route::delete('/{module}/lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');
            });
    });
