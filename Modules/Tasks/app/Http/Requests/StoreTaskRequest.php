<?php

namespace Modules\Tasks\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
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
            'priority' => ['sometimes', 'in:urgent,high,medium,low'],
            'status' => ['sometimes', 'in:pending,in_progress,completed,cancelled'],
            'category' => ['sometimes', 'in:personal,work,university,other'],
            'project_id' => ['nullable', 'uuid', 'exists:projects,id'],
            'parent_task_id' => ['nullable', 'uuid', 'exists:tasks,id'],
            'due_date' => ['nullable', 'date'],
            'reminder' => ['nullable', 'string'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }
}
