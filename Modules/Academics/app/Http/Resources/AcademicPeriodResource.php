<?php

namespace Modules\Academics\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AcademicPeriodResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'startsAt' => $this->starts_at?->format('Y-m-d'),
            'endsAt' => $this->ends_at?->format('Y-m-d'),
            'isCurrent' => $this->is_current,
            'subjectsCount' => $this->subjects_count ?? $this->whenLoaded('subjects', fn () => $this->subjects->count()),
            'subjects' => SubjectResource::collection($this->whenLoaded('subjects')),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
