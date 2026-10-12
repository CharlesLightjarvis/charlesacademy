<?php

declare(strict_types=1);

namespace App\Enums;

enum Level: string
{
    case A1 = 'A1';
    case A2 = 'A2';
    case B1 = 'B1';
    case B2 = 'B2';

    public function label(): string
    {
        return match ($this) {
            self::A1 => 'Débutant',
            self::A2 => 'Élémentaire',
            self::B1 => 'Intermédiaire',
            self::B2 => 'Avancé',
        };
    }
}
