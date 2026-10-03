<?php

namespace Modules\Academics\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academics\Http\Requests\StoreSubjectRequest;
use Modules\Academics\Http\Requests\UpdateSubjectRequest;
use Modules\Academics\Http\Resources\SubjectResource;
use Modules\Academics\Models\Subject;
use Modules\Core\Traits\ApiResponse;

class SubjectController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->subjects()->with(['schedules', 'grades', 'academicPeriod']);

        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhere('professor', 'ilike', "%{$search}%");
            });
        }

        $subjects = $query->orderBy('name')->get();

        return $this->successResponse(SubjectResource::collection($subjects));
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = $request->user()->subjects()->create($request->validated());

        return $this->createdResponse(new SubjectResource($subject->load(['schedules', 'grades'])));
    }

    public function show(Request $request, Subject $subject): JsonResponse
    {
        if ($subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        return $this->successResponse(new SubjectResource($subject->load(['schedules', 'grades', 'academicPeriod'])));
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        if ($subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $subject->update($request->validated());

        return $this->successResponse(new SubjectResource($subject->load(['schedules', 'grades'])), 'Materia actualizada');
    }

    public function destroy(Request $request, Subject $subject): JsonResponse
    {
        if ($subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $subject->delete();

        return $this->successResponse(null, 'Materia eliminada');
    }
}
