<?php

namespace Database\Factories;

use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = ucfirst($this->faker->unique()->word().' '.$this->faker->unique()->word());

        return [
            'title' => $title,
            'description' => $this->faker->sentence(),
            'content' => "# {$title}\n\nContenu de la leçon en **MDX**.",
            'is_active' => true,
        ];
    }
}
