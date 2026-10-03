<?php

namespace Modules\AiChat\Services;

use App\Models\User;

class AiContextService
{
    /**
     * Build contextual snapshot of user's current academic, task, and calendar workload.
     *
     * @return array<string, mixed>
     */
    public function buildContext(User $user): array
    {
        $upcomingEvents = $user->events()
            ->where('starts_at', '>=', now())
            ->where('starts_at', '<=', now()->addDays(7))
            ->orderBy('starts_at')
            ->limit(5)
            ->get(['id', 'title', 'starts_at', 'ends_at', 'category', 'location']);

        $pendingTasks = $user->tasks()
            ->where('status', '!=', 'completed')
            ->orderByRaw("
                CASE priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END
            ")
            ->limit(10)
            ->get(['id', 'title', 'priority', 'status', 'due_date', 'category']);

        $activeProjects = $user->projects()
            ->where('status', 'active')
            ->limit(5)
            ->get(['id', 'name', 'deadline']);

        $subjects = $user->subjects()
            ->with(['schedules', 'grades'])
            ->limit(6)
            ->get(['id', 'name', 'code', 'professor', 'classroom']);

        return [
            'user' => [
                'name' => $user->name,
                'timezone' => $user->timezone,
            ],
            'upcoming_events' => $upcomingEvents->toArray(),
            'pending_tasks' => $pendingTasks->toArray(),
            'active_projects' => $activeProjects->toArray(),
            'subjects' => $subjects->toArray(),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Build rich system prompt with embedded user context for the LLM.
     */
    public function buildSystemPrompt(User $user): string
    {
        $context = $this->buildContext($user);
        $contextJson = json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return <<<PROMPT
Eres Kronos AI, un asistente personal y académico hiper-eficiente, proactivo y empático diseñado para ayudar al usuario a organizar su vida, clases de la universidad, trabajo, proyectos y notas personales.

Información y contexto actual del usuario:
{$contextJson}

Instrucciones:
1. Responde de forma concisa, clara y motivadora en español.
2. Utiliza la información del contexto (tareas pendientes, eventos próximos, materias) para dar respuestas personalizadas y proactivas.
3. Si el usuario te pide planificar su día o semana, prioriza tareas urgentes, respeta sus clases y sugiere descansos.
4. Ayuda al usuario a no sentirse abrumado, desglosando tareas grandes en pasos pequeños y accionables.
PROMPT;
    }
}
