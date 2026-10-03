<?php

namespace Modules\Workspace\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Notes\Http\Resources\NoteResource;
use Modules\Tasks\Http\Resources\TaskResource;

class ProjectResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'color' => $this->color,
            'status' => $this->status,
            'deadline' => $this->deadline?->format('Y-m-d'),
            'tasksCount' => $this->tasks_count ?? $this->whenLoaded('tasks', fn () => $this->tasks->count()),
            'notesCount' => $this->notes_count ?? $this->whenLoaded('notes', fn () => $this->notes->count()),
            'tasks' => TaskResource::collection($this->whenLoaded('tasks')),
            'notes' => NoteResource::collection($this->whenLoaded('notes')),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
