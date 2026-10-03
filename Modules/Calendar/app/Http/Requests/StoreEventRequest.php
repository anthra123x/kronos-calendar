<?php

namespace Modules\Calendar\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'is_all_day' => ['boolean'],
            'category' => ['required', 'in:personal,work,university,other'],
            'is_recurring' => ['boolean'],
            'recurrence_type' => ['nullable', 'required_if:is_recurring,true', 'in:daily,weekly,monthly,yearly'],
            'recurrence_interval' => ['nullable', 'integer', 'min:1'],
            'recurrence_end_date' => ['nullable', 'date', 'after:starts_at'],
            'recurrence_days' => ['nullable', 'array'],
            'reminder' => ['nullable', 'string', 'in:5min,15min,30min,1hour,1day'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }
}
