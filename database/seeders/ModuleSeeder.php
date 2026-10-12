<?php

namespace Database\Seeders;

use App\Enums\Level as LevelEnum;
use App\Models\Level;
use App\Models\Module;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ModuleSeeder extends Seeder
{
    /**
     * Seed the modules table with the first modules of the catalogue.
     *
     * The slug is set by hand: seeding runs without model events
     * (see DatabaseSeeder), so Spatie's slug hook never fires.
     */
    public function run(): void
    {
        $levels = Level::query()->get()->keyBy(fn (Level $level): string => $level->code->value);

        $modules = [
            ['name' => 'Alphabet', 'level' => LevelEnum::A1, 'description' => "Lecture et écriture de l'alphabet."],
            ['name' => 'Salutations', 'level' => LevelEnum::A1, 'description' => 'Les salutations et les formules de politesse.'],
            ['name' => 'Grammaire', 'level' => LevelEnum::A2, 'description' => 'Les règles de grammaire essentielles.'],
            ['name' => 'Vocabulaire', 'level' => LevelEnum::B1, 'description' => 'Les mots du quotidien à retenir.'],
        ];

        foreach ($modules as $module) {
            Module::query()->firstOrCreate(
                ['name' => $module['name']],
                [
                    'slug' => Str::slug($module['name']),
                    'level_id' => $levels->get($module['level']->value)?->id,
                    'description' => $module['description'],
                ]
            );
        }
    }
}
