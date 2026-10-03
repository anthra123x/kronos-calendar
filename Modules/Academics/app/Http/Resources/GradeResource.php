<?php

namespace Modules\Academics\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subjectId' => $this->subject_id,
            'name' => $this->name,
            'score' => $this->score,
            'maxScore' => $this->max_score,
            'weight' => $this->weight,
            'date' => $this->date?->format('Y-m-d'),
            'notes' => $this->notes,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
