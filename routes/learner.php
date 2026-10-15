<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\Learner\LearningPathController;
use App\Http\Controllers\Learner\LessonController;
use App\Http\Controllers\Learner\LessonQuizController;
use App\Http\Controllers\Learner\LessonReadController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:'.RoleEnum::Learner->value])
    ->prefix('learner')
    ->name('learner.')
    ->group(function (): void {
        Route::inertia('dashboard', 'learner/dashboard')
            ->middleware('can:'.PermissionEnum::ViewLearnerDashboard->value)
            ->name('dashboard');

        Route::middleware('can:'.PermissionEnum::ViewLearning->value)
            ->prefix('learn')
            ->name('learn.')
            ->group(function (): void {
                Route::get('/', [LearningPathController::class, 'index'])->name('index');
                Route::post('level', [LearningPathController::class, 'updateLevel'])->name('level.update');

                // URL explicite : learn/modules/{module}/lessons/{lesson}
                Route::get('modules/{module:slug}/lessons/{lesson:slug}', [LessonController::class, 'show'])
                    ->scopeBindings()
                    ->name('lesson.show');
                Route::patch('modules/{module:slug}/lessons/{lesson:slug}/read', [LessonReadController::class, 'update'])
                    ->scopeBindings()
                    ->name('lesson.read');
                Route::get('modules/{module:slug}/lessons/{lesson:slug}/quiz', [LessonQuizController::class, 'show'])
                    ->scopeBindings()
                    ->name('lesson.quiz.show');
                // Correction immédiate d'une réponse (JSON) : la page étudiante
                // demande la correction question par question.
                Route::post('modules/{module:slug}/lessons/{lesson:slug}/quiz/validate', [LessonQuizController::class, 'validateAnswer'])
                    ->scopeBindings()
                    ->name('lesson.quiz.validate');
                Route::post('modules/{module:slug}/lessons/{lesson:slug}/quiz', [LessonQuizController::class, 'submit'])
                    ->scopeBindings()
                    ->name('lesson.quiz.submit');
            });
    });
