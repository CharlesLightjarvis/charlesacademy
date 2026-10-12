<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\QuizController;
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

                Route::get('/{module}/lessons/{lesson}/quiz', [QuizController::class, 'edit'])->name('lessons.quiz.edit');
                Route::post('/{module}/lessons/{lesson}/quiz', [QuizController::class, 'store'])->name('lessons.quiz.store');
                Route::put('/{module}/lessons/{lesson}/quiz', [QuizController::class, 'update'])->name('lessons.quiz.update');
                Route::patch('/{module}/lessons/{lesson}/quiz/questions/reorder', [QuizController::class, 'reorderQuestions'])->name('lessons.quiz.questions.reorder');
                Route::post('/{module}/lessons/{lesson}/quiz/questions', [QuizController::class, 'storeQuestion'])->name('lessons.quiz.questions.store');
                Route::put('/{module}/lessons/{lesson}/quiz/questions/{question}', [QuizController::class, 'updateQuestion'])->name('lessons.quiz.questions.update');
                Route::delete('/{module}/lessons/{lesson}/quiz/questions/{question}', [QuizController::class, 'destroyQuestion'])->name('lessons.quiz.questions.destroy');
            });
    });
