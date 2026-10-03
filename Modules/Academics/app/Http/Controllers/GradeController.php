<?php

namespace Modules\Academics\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academics\Http\Requests\StoreGradeRequest;
use Modules\Academics\Http\Resources\GradeResource;
use Modules\Academics\Models\Grade;
use Modules\Academics\Models\Subject;
use Modules\Core\Traits\ApiResponse;

class GradeController extends Controller
{
    use ApiResponse;

    public function store(StoreGradeRequest $request, Subject $subject): JsonResponse
    {
        if ($subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $grade = $subject->grades()->create($request->validated());

        return $this->createdResponse(new GradeResource($grade));
    }

    public function update(StoreGradeRequest $request, Grade $grade): JsonResponse
    {
        if ($grade->subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $grade->update($request->validated());

        return $this->successResponse(new GradeResource($grade), 'Calificación actualizada');
    }

    public function destroy(Request $request, Grade $grade): JsonResponse
    {
        if ($grade->subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $grade->delete();

        return $this->successResponse(null, 'Calificación eliminada');
    }
}
