<?php

namespace Modules\Notes\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use Modules\Notes\Http\Requests\StoreNoteRequest;
use Modules\Notes\Http\Requests\UpdateNoteRequest;
use Modules\Notes\Http\Resources\NoteResource;
use Modules\Notes\Models\Note;

class NoteController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->notes()->with(['tags', 'attachments']);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->boolean('pinned')) {
            $query->where('is_pinned', true);
        }

        if ($request->boolean('favorites')) {
            $query->where('is_favorite', true);
        }

        if ($request->boolean('archived')) {
            $query->where('is_archived', true);
        } else {
            $query->where('is_archived', false);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('content', 'ilike', "%{$search}%");
            });
        }

        $notes = $query->orderByDesc('is_pinned')->orderByDesc('updated_at')->paginate(20);

        return $this->paginatedResponse($notes);
    }

    public function store(StoreNoteRequest $request): JsonResponse
    {
        $note = $request->user()->notes()->create($request->safe()->except('tags'));

        if ($request->filled('tags')) {
            $note->syncTags($request->tags);
        }

        return $this->createdResponse(new NoteResource($note->load(['tags', 'attachments'])));
    }

    public function show(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        return $this->successResponse(new NoteResource($note->load(['tags', 'attachments'])));
    }

    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $note->update($request->safe()->except('tags'));

        if ($request->has('tags')) {
            $note->syncTags($request->tags);
        }

        return $this->successResponse(new NoteResource($note->load(['tags', 'attachments'])), 'Nota actualizada');
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $note->delete();

        return $this->successResponse(null, 'Nota eliminada');
    }
}
