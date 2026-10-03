<?php

namespace Modules\Calendar\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'color' => $this->color,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'is_all_day' => $this->is_all_day,
            'category' => $this->category,
            'status' => $this->status,
            'is_recurring' => $this->is_recurring,
            'recurrence_type' => $this->recurrence_type,
            'recurrence_interval' => $this->recurrence_interval,
            'recurrence_end_date' => $this->recurrence_end_date?->toDateString(),
            'recurrence_days' => $this->recurrence_days,
            'reminder' => $this->reminder,
            'tags' => $this->tags->pluck('name'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
