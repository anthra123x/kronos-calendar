<?php

namespace Modules\Workspace\Http\Controllers;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use Modules\Workspace\Http\Requests\StoreTimeEntryRequest;
use Modules\Workspace\Http\Resources\TimeEntryResource;
use Modules\Workspace\Models\TimeEntry;

class TimeEntryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = TimeEntry::where('user_id', $request->user()->id)
            ->with(['project', 'task']);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        if ($request->filled('from')) {
            $query->where('started_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->where('started_at', '<=', $request->to);
        }

        $entries = $query->orderByDesc('started_at')->paginate(30);

        return $this->paginatedResponse($entries);
    }

    public function running(Request $request): JsonResponse
    {
        $running = TimeEntry::where('user_id', $request->user()->id)
            ->whereNull('ended_at')
            ->with(['project', 'task'])
            ->first();

        return $this->successResponse($running ? new TimeEntryResource($running) : null);
    }

    public function store(StoreTimeEntryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        if (! empty($data['started_at']) && ! empty($data['ended_at']) && empty($data['duration_minutes'])) {
            $start = Carbon::parse($data['started_at']);
            $end = Carbon::parse($data['ended_at']);
            $data['duration_minutes'] = (int) round($start->diffInMinutes($end));
        }

        $entry = TimeEntry::create($data);

        return $this->createdResponse(new TimeEntryResource($entry->load(['project', 'task'])));
    }

    public function stop(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        if ($timeEntry->ended_at !== null) {
            return $this->errorResponse('Este temporizador ya ha sido detenido', 400);
        }

        $endedAt = now();
        $duration = (int) round($timeEntry->started_at->diffInMinutes($endedAt));

        $timeEntry->update([
            'ended_at' => $endedAt,
            'duration_minutes' => $duration,
        ]);

        return $this->successResponse(new TimeEntryResource($timeEntry->load(['project', 'task'])), 'Temporizador detenido');
    }

    public function destroy(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $timeEntry->delete();

        return $this->successResponse(null, 'Registro de tiempo eliminado');
    }
}
