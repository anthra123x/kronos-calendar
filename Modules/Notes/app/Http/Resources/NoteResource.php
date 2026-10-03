<?php

namespace Modules\Notes\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'format' => $this->format,
            'category' => $this->category,
            'projectId' => $this->project_id,
            'isPinned' => $this->is_pinned,
            'isFavorite' => $this->is_favorite,
            'isArchived' => $this->is_archived,
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('name')),
            'attachments' => $this->whenLoaded('attachments'),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
