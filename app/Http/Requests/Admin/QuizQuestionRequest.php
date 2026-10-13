<?php

namespace App\Http\Requests\Admin;

use App\Enums\PermissionEnum;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuizQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can(PermissionEnum::ManageContent->value) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'max:1000'],
            'options' => ['required', 'array'],
            'options.a' => ['required', 'string', 'max:255'],
            'options.b' => ['required', 'string', 'max:255'],
            'options.c' => ['required', 'string', 'max:255'],
            // La quatrième proposition est facultative.
            'options.d' => ['nullable', 'string', 'max:255'],
            'correct_option' => [
                'required',
                Rule::in(['a', 'b', 'c', 'd']),
                // La bonne réponse doit exister vraiment parmi les propositions.
                function (string $attribute, mixed $value, Closure $fail): void {
                    if ($value === 'd' && blank($this->input('options.d'))) {
                        $fail('La proposition D doit être renseignée pour être la bonne réponse.');
                    }
                },
            ],
            'explanation' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * La proposition D vide n'existe pas : on la retire du payload pour ne
     * jamais enregistrer une réponse sans libellé.
     */
    protected function prepareForValidation(): void
    {
        $options = $this->input('options', []);

        if (is_array($options) && trim((string) ($options['d'] ?? '')) === '') {
            unset($options['d']);
            $this->merge(['options' => $options]);
        }
    }
}
