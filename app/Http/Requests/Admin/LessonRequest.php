<?php

namespace App\Http\Requests\Admin;

use App\Enums\PermissionEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LessonRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            // Un brouillon peut rester vide : le contenu MDX n'est exigé qu'à la publication.
            'content' => [
                Rule::requiredIf(fn (): bool => (bool) filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN)),
                'nullable',
                'string',
                'max:1000000',
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
