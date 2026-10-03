<?php

namespace Modules\Academics\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academics\Http\Requests\StoreClassScheduleRequest;
use Modules\Academics\Http\Resources\ClassScheduleResource;
use Modules\Academics\Models\ClassSchedule;
use Modules\Academics\Models\Subject;
use Modules\Core\Traits\ApiResponse;

class ClassScheduleController extends Controller
{
    use ApiResponse;

    /**
     * Get visual weekly timetable of all classes for the user's current subjects.
     */
    public function weekly(Request $request): JsonResponse
    {
        $userSubjectIds = $request->user()->subjects()->pluck('id');

        $schedules = ClassSchedule::whereIn('subject_id', $userSubjectIds)
            ->with('subject')
            ->orderBy('starts_at')
            ->get();

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $organized = [];

        foreach ($days as $day) {
            $daySchedules = $schedules->where('day_of_week', $day)->values();
            $organized[$day] = ClassScheduleResource::collection($daySchedules);
        }

        return $this->successResponse($organized);
    }

    public function store(StoreClassScheduleRequest $request): JsonResponse
    {
        $subject = Subject::findOrFail($request->subject_id);

        if ($subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $schedule = $subject->schedules()->create($request->validated());

        return $this->createdResponse(new ClassScheduleResource($schedule->load('subject')));
    }

    public function destroy(Request $request, ClassSchedule $schedule): JsonResponse
    {
        if ($schedule->subject->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $schedule->delete();

        return $this->successResponse(null, 'Horario de clase eliminado');
    }
}
