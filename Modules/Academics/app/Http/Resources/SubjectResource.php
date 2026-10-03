<?php

namespace Modules\Academics\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'academicPeriodId' => $this->academic_period_id,
            'name' => $this->name,
            'code' => $this->code,
            'professor' => $this->professor,
            'classroom' => $this->classroom,
            'color' => $this->color,
            'credits' => $this->credits,
            'notes' => $this->notes,
            'weightedAverage' => $this->weighted_average,
            'schedules' => ClassScheduleResource::collection($this->whenLoaded('schedules')),
            'grades' => GradeResource::collection($this->whenLoaded('grades')),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
