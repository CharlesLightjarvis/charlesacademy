<?php

namespace App\Http\Requests\Admin;

use App\Enums\PermissionEnum;
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
            'correct_option' => ['required', Rule::in(['a', 'b', 'c'])],
            'explanation' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
