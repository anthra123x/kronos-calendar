<?php

namespace Modules\Academics\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassScheduleResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subjectId' => $this->subject_id,
            'dayOfWeek' => $this->day_of_week,
            'startsAt' => $this->starts_at,
            'endsAt' => $this->ends_at,
            'classroom' => $this->classroom,
            'subject' => $this->whenLoaded('subject', fn () => [
                'id' => $this->subject->id,
                'name' => $this->subject->name,
                'color' => $this->subject->color,
                'professor' => $this->subject->professor,
            ]),
        ];
    }
}
