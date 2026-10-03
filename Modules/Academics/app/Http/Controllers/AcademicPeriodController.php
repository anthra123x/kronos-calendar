<?php

namespace Modules\Academics\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academics\Http\Requests\StoreAcademicPeriodRequest;
use Modules\Academics\Http\Resources\AcademicPeriodResource;
use Modules\Academics\Models\AcademicPeriod;
use Modules\Core\Traits\ApiResponse;

class AcademicPeriodController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $periods = $request->user()->academicPeriods()
            ->withCount('subjects')
            ->orderByDesc('starts_at')
            ->get();

        return $this->successResponse(AcademicPeriodResource::collection($periods));
    }

    public function current(Request $request): JsonResponse
    {
        $period = $request->user()->academicPeriods()
            ->where('is_current', true)
            ->with(['subjects.schedules', 'subjects.grades'])
            ->first();

        if (! $period) {
            $period = $request->user()->academicPeriods()
                ->orderByDesc('starts_at')
                ->with(['subjects.schedules', 'subjects.grades'])
                ->first();
        }

        if (! $period) {
            return $this->successResponse(null, 'No hay períodos académicos registrados');
        }

        return $this->successResponse(new AcademicPeriodResource($period));
    }

    public function store(StoreAcademicPeriodRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['is_current'])) {
            $request->user()->academicPeriods()->update(['is_current' => false]);
        }

        $period = $request->user()->academicPeriods()->create($data);

        return $this->createdResponse(new AcademicPeriodResource($period));
    }

    public function show(Request $request, AcademicPeriod $period): JsonResponse
    {
        if ($period->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $period->load(['subjects.schedules', 'subjects.grades']);

        return $this->successResponse(new AcademicPeriodResource($period));
    }

    public function update(StoreAcademicPeriodRequest $request, AcademicPeriod $period): JsonResponse
    {
        if ($period->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $data = $request->validated();

        if (! empty($data['is_current'])) {
            $request->user()->academicPeriods()
                ->where('id', '!=', $period->id)
                ->update(['is_current' => false]);
        }

        $period->update($data);

        return $this->successResponse(new AcademicPeriodResource($period), 'Período actualizado');
    }

    public function destroy(Request $request, AcademicPeriod $period): JsonResponse
    {
        if ($period->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $period->delete();

        return $this->successResponse(null, 'Período académico eliminado');
    }
}
