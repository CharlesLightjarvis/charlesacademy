<?php

namespace Database\Seeders;

use App\Enums\Level as LevelEnum;
use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Seed the four CECRL levels (A1 → B2) from the Level enum.
     */
    public function run(): void
    {
        foreach (LevelEnum::cases() as $index => $level) {
            Level::query()->firstOrCreate(
                ['code' => $level->value],
                [
                    'name' => $level->label(),
                    'order_column' => $index + 1,
                ]
            );
        }
    }
}
