<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\Learner\LearnController;
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
                Route::get('/', [LearnController::class, 'index'])->name('index');
                Route::post('level', [LearnController::class, 'updateLevel'])->name('level.update');

                // URL explicite : learn/modules/{module}/lessons/{lesson}
                Route::get('modules/{module:slug}/lessons/{lesson:slug}', [LearnController::class, 'show'])
                    ->name('lesson.show');
                Route::patch('modules/{module:slug}/lessons/{lesson:slug}/read', [LearnController::class, 'toggleRead'])
                    ->name('lesson.read');
                Route::get('modules/{module:slug}/lessons/{lesson:slug}/quiz', [LearnController::class, 'showQuiz'])
                    ->name('lesson.quiz.show');
                // Correction immédiate d'une réponse (JSON) : la page étudiante
                // demande la correction question par question.
                Route::post('modules/{module:slug}/lessons/{lesson:slug}/quiz/validate', [LearnController::class, 'validateAnswer'])
                    ->name('lesson.quiz.validate');
                Route::post('modules/{module:slug}/lessons/{lesson:slug}/quiz', [LearnController::class, 'submitQuiz'])
                    ->name('lesson.quiz.submit');
            });
    });
