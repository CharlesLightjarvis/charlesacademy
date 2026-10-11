<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class UsersSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $users = [
            ['role' => RoleEnum::Admin, 'name' => 'Admin', 'email' => 'admin@charlesacademy.test'],
            ['role' => RoleEnum::Learner, 'name' => 'Apprenant', 'email' => 'learner@charlesacademy.test'],
        ];

        foreach ($users as $entry) {
            $user = User::firstOrCreate(
                ['email' => $entry['email']],
                [
                    'name' => $entry['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$entry['role']->value]);
        }
    }
}
