<?php

namespace Database\Factories;

use App\Models\Level;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Module>
 */
class ModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst($this->faker->unique()->word().' '.$this->faker->unique()->word()),
            'level_id' => Level::query()->inRandomOrder()->first()?->id,
            'description' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}
