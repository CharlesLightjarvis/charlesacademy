<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleEnum: string
{
    case Admin = 'admin';
    case Learner = 'learner';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur',
            self::Learner => 'Apprenant',
        };
    }

    /**
     * @return array<int, PermissionEnum>
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Admin => [
                PermissionEnum::ViewAdminDashboard,
                PermissionEnum::PracticeGrammar,
                PermissionEnum::PracticeVocabulary,
                PermissionEnum::PracticeOral,
                PermissionEnum::TakeQuizzes,
                PermissionEnum::ViewProgress,
                PermissionEnum::ManageContent,
                PermissionEnum::ManageUsers,
            ],
            self::Learner => [
                PermissionEnum::ViewLearnerDashboard,
                PermissionEnum::ViewLearning,
                PermissionEnum::PracticeGrammar,
                PermissionEnum::PracticeVocabulary,
                PermissionEnum::PracticeOral,
                PermissionEnum::TakeQuizzes,
                PermissionEnum::ViewProgress,
            ],
        };
    }

    /** @return array<int, self> */
    public static function activeCases(): array
    {
        return self::cases();
    }
}
