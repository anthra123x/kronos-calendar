<?php

namespace Modules\Workspace\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeEntryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'projectId' => $this->project_id,
            'taskId' => $this->task_id,
            'description' => $this->description,
            'startedAt' => $this->started_at?->toIso8601String(),
            'endedAt' => $this->ended_at?->toIso8601String(),
            'durationMinutes' => $this->duration_minutes ?? ($this->started_at && $this->ended_at ? $this->started_at->diffInMinutes($this->ended_at) : null),
            'project' => $this->whenLoaded('project', fn () => [
                'id' => $this->project->id,
                'name' => $this->project->name,
                'color' => $this->project->color,
            ]),
            'task' => $this->whenLoaded('task', fn () => [
                'id' => $this->task->id,
                'title' => $this->task->title,
            ]),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
