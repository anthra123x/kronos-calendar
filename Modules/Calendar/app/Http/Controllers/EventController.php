<?php

namespace Modules\Calendar\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Calendar\Http\Requests\StoreEventRequest;
use Modules\Calendar\Http\Requests\UpdateEventRequest;
use Modules\Calendar\Http\Resources\EventResource;
use Modules\Calendar\Models\Event;
use Modules\Core\Traits\ApiResponse;

class EventController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->events()->with('tags');

        if ($request->filled('start')) {
            $query->where('starts_at', '>=', $request->start);
        }

        if ($request->filled('end')) {
            $query->where('ends_at', '<=', $request->end);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $events = $query->orderBy('starts_at')->get();

        return $this->successResponse(EventResource::collection($events));
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = $request->user()->events()->create($request->validated());

        if ($request->filled('tags')) {
            $event->syncTags($request->tags);
        }

        return $this->createdResponse(new EventResource($event->load('tags')));
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        return $this->successResponse(new EventResource($event->load('tags')));
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $event->update($request->validated());

        if ($request->has('tags')) {
            $event->syncTags($request->tags);
        }

        return $this->successResponse(new EventResource($event->load('tags')), 'Evento actualizado');
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $event->delete();

        return $this->successResponse(null, 'Evento eliminado');
    }
}
