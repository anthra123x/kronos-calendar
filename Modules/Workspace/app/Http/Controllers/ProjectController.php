<?php

namespace Modules\Workspace\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use Modules\Workspace\Http\Requests\StoreProjectRequest;
use Modules\Workspace\Http\Requests\UpdateProjectRequest;
use Modules\Workspace\Http\Resources\ProjectResource;
use Modules\Workspace\Models\Project;

class ProjectController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->projects()->withCount(['tasks', 'notes']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $projects = $query->orderBy('name')->get();

        return $this->successResponse(ProjectResource::collection($projects));
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $request->user()->projects()->create($request->validated());

        return $this->createdResponse(new ProjectResource($project));
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $project->load(['tasks', 'notes']);

        return $this->successResponse(new ProjectResource($project));
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        if ($project->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $project->update($request->validated());

        return $this->successResponse(new ProjectResource($project), 'Proyecto actualizado');
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $project->delete();

        return $this->successResponse(null, 'Proyecto eliminado');
    }
}
