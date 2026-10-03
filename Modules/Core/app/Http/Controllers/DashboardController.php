<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Academics\Http\Resources\ClassScheduleResource;
use Modules\Academics\Models\ClassSchedule;
use Modules\Calendar\Http\Resources\EventResource;
use Modules\Core\Traits\ApiResponse;
use Modules\Tasks\Http\Resources\TaskResource;
use Modules\Workspace\Http\Resources\ProjectResource;
use Modules\Workspace\Http\Resources\TimeEntryResource;
use Modules\Workspace\Models\TimeEntry;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $tz = $user->timezone ?? 'America/Bogota';
        $now = Carbon::now($tz);
        $todayStart = $now->copy()->startOfDay()->setTimezone('UTC');
        $todayEnd = $now->copy()->endOfDay()->setTimezone('UTC');
        $currentDayOfWeek = strtolower($now->locale('en')->isoFormat('dddd')); // monday, tuesday, etc.

        // 1. Eventos de hoy
        $todayEvents = $user->events()
            ->where(function ($q) use ($todayStart, $todayEnd) {
                $q->whereBetween('starts_at', [$todayStart, $todayEnd])
                    ->orWhere(function ($sub) use ($todayStart, $todayEnd) {
                        $sub->where('starts_at', '<=', $todayStart)
                            ->where('ends_at', '>=', $todayEnd);
                    });
            })
            ->orderBy('starts_at')
            ->get();

        // 2. Clases de hoy
        $userSubjectIds = $user->subjects()->pluck('id');
        $todayClasses = ClassSchedule::whereIn('subject_id', $userSubjectIds)
            ->where('day_of_week', $currentDayOfWeek)
            ->with('subject')
            ->orderBy('starts_at')
            ->get();

        // 3. Tareas prioritarias y pendientes
        $urgentTasks = $user->tasks()
            ->where('status', '!=', 'completed')
            ->orderByRaw("
                CASE priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END
            ")
            ->orderBy('due_date')
            ->limit(7)
            ->get();

        // 4. Proyectos activos
        $activeProjects = $user->projects()
            ->where('status', 'active')
            ->withCount(['tasks', 'notes'])
            ->limit(4)
            ->get();

        // 5. Temporizador activo actual
        $activeTimer = TimeEntry::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->with(['project', 'task'])
            ->first();

        // 6. Contadores y métricas globales
        $counts = [
            'pending_tasks' => $user->tasks()->where('status', '!=', 'completed')->count(),
            'completed_tasks_today' => $user->tasks()->where('status', 'completed')->whereBetween('completed_at', [$todayStart, $todayEnd])->count(),
            'events_today' => $todayEvents->count(),
            'classes_today' => $todayClasses->count(),
            'unread_notifications' => $user->userNotifications()->whereNull('read_at')->count(),
            'active_projects' => $user->projects()->where('status', 'active')->count(),
        ];

        return $this->successResponse([
            'date' => [
                'current_iso' => $now->toIso8601String(),
                'day_name' => $now->locale('es')->isoFormat('dddd'),
                'formatted' => $now->locale('es')->isoFormat('D [de] MMMM, YYYY'),
                'timezone' => $tz,
            ],
            'counters' => $counts,
            'today_events' => EventResource::collection($todayEvents),
            'today_classes' => ClassScheduleResource::collection($todayClasses),
            'urgent_tasks' => TaskResource::collection($urgentTasks),
            'active_projects' => ProjectResource::collection($activeProjects),
            'active_timer' => $activeTimer ? new TimeEntryResource($activeTimer) : null,
        ]);
    }
}
