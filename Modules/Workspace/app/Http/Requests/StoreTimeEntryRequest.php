<?php

namespace Modules\Workspace\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimeEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'uuid', 'exists:projects,id'],
            'task_id' => ['nullable', 'uuid', 'exists:tasks,id'],
            'description' => ['nullable', 'string', 'max:255'],
            'started_at' => ['required', 'date'],
            'ended_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
