<?php

namespace Modules\Academics\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAcademicPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'is_current' => ['sometimes', 'boolean'],
        ];
    }
}
