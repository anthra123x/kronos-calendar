<?php

namespace Modules\Tasks\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use Modules\Tasks\Http\Requests\StoreTaskRequest;
use Modules\Tasks\Http\Requests\UpdateTaskRequest;
use Modules\Tasks\Http\Resources\TaskResource;
use Modules\Tasks\Models\Task;

class TaskController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks()
            ->with(['tags', 'subtasks'])
            ->whereNull('parent_task_id'); // Solo tareas raíz

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->boolean('overdue')) {
            $query->where('due_date', '<', now())->where('status', '!=', 'completed');
        }

        $tasks = $query->orderByRaw("
            CASE priority
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END
        ")->orderBy('due_date')->paginate(25);

        return $this->paginatedResponse($tasks);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $request->user()->tasks()->create($request->safe()->except('tags'));

        if ($request->filled('tags')) {
            $task->syncTags($request->tags);
        }

        return $this->createdResponse(new TaskResource($task->load(['tags', 'subtasks'])));
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        return $this->successResponse(new TaskResource($task->load(['tags', 'subtasks'])));
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $data = $request->safe()->except('tags');

        // Auto-set completed_at cuando se marca como completada
        if (isset($data['status']) && $data['status'] === 'completed' && ! $task->completed_at) {
            $data['completed_at'] = now();
        }

        $task->update($data);

        if ($request->has('tags')) {
            $task->syncTags($request->tags);
        }

        return $this->successResponse(new TaskResource($task->load(['tags', 'subtasks'])), 'Tarea actualizada');
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $task->delete();

        return $this->successResponse(null, 'Tarea eliminada');
    }
}
