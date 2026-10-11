<?php

declare(strict_types=1);

namespace App\Enums;

enum PermissionEnum: string
{
    case ViewAdminDashboard = 'view.admin-dashboard';
    case ViewLearnerDashboard = 'view.learner-dashboard';
    case ViewLearning = 'view.learning';
    case PracticeGrammar = 'practice.grammar';
    case PracticeVocabulary = 'practice.vocabulary';
    case PracticeOral = 'practice.oral';
    case TakeQuizzes = 'take.quizzes';
    case ViewProgress = 'view.progress';
    case ManageContent = 'manage.content';
    case ManageUsers = 'manage.users';
}
