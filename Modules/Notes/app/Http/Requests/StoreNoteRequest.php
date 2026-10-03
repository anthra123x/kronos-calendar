<?php

namespace Modules\Notes\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
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
            'content' => ['nullable', 'string'],
            'format' => ['sometimes', 'in:markdown,html,plain'],
            'category' => ['sometimes', 'in:personal,work,university,idea,other'],
            'project_id' => ['nullable', 'uuid', 'exists:projects,id'],
            'is_pinned' => ['sometimes', 'boolean'],
            'is_favorite' => ['sometimes', 'boolean'],
            'is_archived' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }
}
