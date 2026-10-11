<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    /**
     * Give every seeded module one published lesson and one draft lesson,
     * to play with the lessons tab, the drag and drop and the status filter.
     */
    public function run(): void
    {
        Module::query()->get()->each(function (Module $module): void {
            $module->lessons()->firstOrCreate(
                ['title' => 'Introduction'],
                [
                    'description' => "Les bases du module {$module->name}.",
                    'content' => "# {$module->name}\n\nPremière leçon : les essentiels à retenir.\n\n- Un point clé\n- Un autre point\n\n> Astuce de prononciation.",
                    'is_active' => true,
                ]
            );

            $module->lessons()->firstOrCreate(
                ['title' => 'Exercice pratique'],
                [
                    'description' => "Mettre en pratique le module {$module->name}.",
                    'is_active' => false,
                ]
            );
        });
    }
}
