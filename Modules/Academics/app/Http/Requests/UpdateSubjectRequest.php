<?php

namespace Modules\Academics\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'academic_period_id' => ['sometimes', 'uuid', 'exists:academic_periods,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'professor' => ['nullable', 'string', 'max:255'],
            'classroom' => ['nullable', 'string', 'max:100'],
            'color' => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'credits' => ['nullable', 'integer', 'min:0', 'max:30'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
