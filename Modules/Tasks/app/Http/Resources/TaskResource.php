<?php

namespace Modules\Tasks\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status,
            'category' => $this->category,
            'projectId' => $this->project_id,
            'parentTaskId' => $this->parent_task_id,
            'dueDate' => $this->due_date?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'sortOrder' => $this->sort_order,
            'reminder' => $this->reminder,
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('name')),
            'subtasks' => TaskResource::collection($this->whenLoaded('subtasks')),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
