<?php

namespace Modules\AiChat\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversationId' => $this->conversation_id,
            'role' => $this->role,
            'content' => $this->content,
            'metadata' => $this->metadata,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
