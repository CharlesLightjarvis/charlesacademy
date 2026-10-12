<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizQuestion>
 */
class QuizQuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::factory(),
            'prompt' => $this->faker->sentence().' ?',
            'options' => [
                'a' => $this->faker->word(),
                'b' => $this->faker->word(),
                'c' => $this->faker->word(),
            ],
            'correct_option' => 'a',
            'explanation' => $this->faker->sentence(),
        ];
    }
}
