<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UsersSeeder::class,
            LevelSeeder::class,
            ModuleSeeder::class,
            LessonSeeder::class,
            QuizSeeder::class,
        ]);
    }
}
