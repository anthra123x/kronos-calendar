<?php

namespace Modules\Academics\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'max_score' => ['sometimes', 'numeric', 'min:0.1', 'max:100'],
            'weight' => ['sometimes', 'numeric', 'min:0.01', 'max:100'],
            'date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
