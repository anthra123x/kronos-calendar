<?php

namespace Modules\AiChat\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'context' => $this->context,
            'messagesCount' => $this->messages_count ?? $this->whenLoaded('messages', fn () => $this->messages->count()),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
