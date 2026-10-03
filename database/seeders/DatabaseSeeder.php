<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Academics\Models\AcademicPeriod;
use Modules\Academics\Models\ClassSchedule;
use Modules\Academics\Models\Grade;
use Modules\Academics\Models\Subject;
use Modules\AiChat\Models\Conversation;
use Modules\Calendar\Models\Event;
use Modules\Notes\Models\Note;
use Modules\Notifications\Models\UserNotification;
use Modules\Tasks\Models\Task;
use Modules\Workspace\Models\Project;
use Modules\Workspace\Models\TimeEntry;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Usuario Demo
        $user = User::updateOrCreate(
            ['email' => 'demo@kronos.app'],
            [
                'name' => 'Alfonso',
                'password' => Hash::make('password'),
                'timezone' => 'America/Bogota',
                'locale' => 'es',
                'bio' => 'Estudiante de ingeniería, desarrollador y entusiasta de la productividad.',
                'preferences' => [
                    'theme' => 'dark',
                    'compact_view' => false,
                    'ai_suggestions' => true,
                ],
            ]
        );

        // 2. Proyectos de Workspace
        $projectKronos = Project::create([
            'user_id' => $user->id,
            'name' => 'Kronos App',
            'description' => 'Plataforma integral de gestión de tiempo, estudios, vida y trabajo.',
            'color' => '#6366F1',
            'status' => 'active',
            'deadline' => Carbon::now()->addMonths(2)->format('Y-m-d'),
        ]);

        $projectThesis = Project::create([
            'user_id' => $user->id,
            'name' => 'Tesis de Grado',
            'description' => 'Investigación sobre optimización de sistemas distribuidos y LLMs.',
            'color' => '#EC4899',
            'status' => 'active',
            'deadline' => Carbon::now()->addMonths(3)->format('Y-m-d'),
        ]);

        $projectPersonal = Project::create([
            'user_id' => $user->id,
            'name' => 'Vida Personal & Finanzas',
            'description' => 'Hábitos saludables, metas de ahorro y organización personal.',
            'color' => '#10B981',
            'status' => 'active',
        ]);

        // 3. Período Académico y Materias
        $period = AcademicPeriod::create([
            'user_id' => $user->id,
            'name' => '2026-2',
            'starts_at' => Carbon::now()->subMonths(1)->startOfMonth()->format('Y-m-d'),
            'ends_at' => Carbon::now()->addMonths(3)->endOfMonth()->format('Y-m-d'),
            'is_current' => true,
        ]);

        // Materia 1: IA
        $subjectAi = Subject::create([
            'user_id' => $user->id,
            'academic_period_id' => $period->id,
            'name' => 'Inteligencia Artificial',
            'code' => 'CC-501',
            'professor' => 'Dr. Arboleda',
            'classroom' => 'Lab 302',
            'color' => '#3B82F6',
            'credits' => 4,
            'notes' => 'Enfoque en redes neuronales, transformers y agentes autónomos.',
        ]);

        ClassSchedule::create([
            'subject_id' => $subjectAi->id,
            'day_of_week' => 'tuesday',
            'starts_at' => '08:00',
            'ends_at' => '10:00',
            'classroom' => 'Lab 302',
        ]);
        ClassSchedule::create([
            'subject_id' => $subjectAi->id,
            'day_of_week' => 'thursday',
            'starts_at' => '08:00',
            'ends_at' => '10:00',
            'classroom' => 'Lab 302',
        ]);

        Grade::create([
            'subject_id' => $subjectAi->id,
            'name' => 'Parcial 1: Algoritmos de Búsqueda',
            'score' => 4.6,
            'max_score' => 5.0,
            'weight' => 25.0,
            'date' => Carbon::now()->subDays(10)->format('Y-m-d'),
        ]);
        Grade::create([
            'subject_id' => $subjectAi->id,
            'name' => 'Taller Práctico: Redes Neuronales',
            'score' => 4.8,
            'max_score' => 5.0,
            'weight' => 20.0,
            'date' => Carbon::now()->subDays(3)->format('Y-m-d'),
        ]);

        // Materia 2: Arquitectura
        $subjectArch = Subject::create([
            'user_id' => $user->id,
            'academic_period_id' => $period->id,
            'name' => 'Arquitectura de Software',
            'code' => 'CC-405',
            'professor' => 'Ing. Morales',
            'classroom' => 'A-204',
            'color' => '#8B5CF6',
            'credits' => 3,
            'notes' => 'Monolito modular, DDD, Clean Architecture y microservicios.',
        ]);

        ClassSchedule::create([
            'subject_id' => $subjectArch->id,
            'day_of_week' => 'monday',
            'starts_at' => '10:00',
            'ends_at' => '12:00',
            'classroom' => 'A-204',
        ]);
        ClassSchedule::create([
            'subject_id' => $subjectArch->id,
            'day_of_week' => 'wednesday',
            'starts_at' => '10:00',
            'ends_at' => '12:00',
            'classroom' => 'A-204',
        ]);

        Grade::create([
            'subject_id' => $subjectArch->id,
            'name' => 'Caso de Estudio: Monolitos Modulares',
            'score' => 4.4,
            'max_score' => 5.0,
            'weight' => 30.0,
            'date' => Carbon::now()->subDays(15)->format('Y-m-d'),
        ]);

        // Materia 3: Bases de Datos
        $subjectDb = Subject::create([
            'user_id' => $user->id,
            'academic_period_id' => $period->id,
            'name' => 'Bases de Datos Distribuidas',
            'code' => 'CC-408',
            'professor' => 'Dra. Restrepo',
            'classroom' => 'Lab 101',
            'color' => '#10B981',
            'credits' => 3,
            'notes' => 'PostgreSQL sharding, Neon serverless, particionamiento y replicación.',
        ]);

        ClassSchedule::create([
            'subject_id' => $subjectDb->id,
            'day_of_week' => 'friday',
            'starts_at' => '14:00',
            'ends_at' => '17:00',
            'classroom' => 'Lab 101',
        ]);

        // 4. Tareas
        $task1 = Task::create([
            'user_id' => $user->id,
            'project_id' => null,
            'title' => 'Entregar informe de arquitectura modular',
            'description' => 'Documentar decisiones arquitectónicas tomadas con Laravel 12 y nwidart/modules.',
            'priority' => 'urgent',
            'status' => 'pending',
            'category' => 'university',
            'due_date' => Carbon::now()->addDays(1)->setTime(23, 59),
        ]);

        $task2 = Task::create([
            'user_id' => $user->id,
            'project_id' => $projectKronos->id,
            'title' => 'Implementar endpoints de Dashboard y estadísticas',
            'description' => 'Crear controlador agregador para la pantalla inicial de Kronos.',
            'priority' => 'high',
            'status' => 'in_progress',
            'category' => 'work',
            'due_date' => Carbon::now()->addDays(2)->setTime(18, 0),
        ]);

        $task3 = Task::create([
            'user_id' => $user->id,
            'project_id' => $projectPersonal->id,
            'title' => 'Pagar suscripciones y servicios del mes',
            'description' => 'Hosting, internet y servicios públicos.',
            'priority' => 'medium',
            'status' => 'pending',
            'category' => 'personal',
            'due_date' => Carbon::now()->addDays(3)->setTime(12, 0),
        ]);

        $task4 = Task::create([
            'user_id' => $user->id,
            'project_id' => $projectThesis->id,
            'title' => 'Revisión bibliográfica de técnicas RAG',
            'description' => 'Leer los últimos papers de recuperación híbrida y vector search.',
            'priority' => 'medium',
            'status' => 'pending',
            'category' => 'university',
            'due_date' => Carbon::now()->addDays(5)->setTime(17, 0),
        ]);

        // Subtarea
        Task::create([
            'user_id' => $user->id,
            'parent_task_id' => $task1->id,
            'title' => 'Elaborar diagrama Mermaid de relaciones de módulos',
            'priority' => 'urgent',
            'status' => 'completed',
            'completed_at' => Carbon::now()->subHours(2),
            'category' => 'university',
        ]);

        // 5. Eventos de Calendario
        Event::create([
            'user_id' => $user->id,
            'title' => 'Reunión de Sincronización de Proyecto',
            'description' => 'Revisión semanal con el equipo sobre avances y bloqueos.',
            'location' => 'Google Meet',
            'color' => '#F59E0B',
            'starts_at' => Carbon::now()->addDay()->setTime(15, 0),
            'ends_at' => Carbon::now()->addDay()->setTime(16, 0),
            'category' => 'work',
            'status' => 'scheduled',
        ]);

        Event::create([
            'user_id' => $user->id,
            'title' => 'Laboratorio Práctico de IA',
            'description' => 'Sesión de entrenamiento de modelos en clúster GPU.',
            'location' => 'Lab 302',
            'color' => '#3B82F6',
            'starts_at' => Carbon::now()->addDays(2)->setTime(8, 0),
            'ends_at' => Carbon::now()->addDays(2)->setTime(10, 0),
            'category' => 'university',
            'status' => 'scheduled',
        ]);

        Event::create([
            'user_id' => $user->id,
            'title' => 'Entrenamiento en Gimnasio',
            'description' => 'Rutina de fuerza y movilidad.',
            'location' => 'Gimnasio SmartFit',
            'color' => '#10B981',
            'starts_at' => Carbon::now()->setTime(18, 30),
            'ends_at' => Carbon::now()->setTime(19, 45),
            'category' => 'personal',
            'status' => 'scheduled',
        ]);

        // 6. Notas
        Note::create([
            'user_id' => $user->id,
            'project_id' => $projectKronos->id,
            'title' => 'Arquitectura y Visión de Kronos',
            'content' => "# Kronos\n\nSistema unificado para organizar vida, universidad, proyectos y notas.\n\n- Backend: Laravel 12 monolito modular\n- Frontend: Angular 19+ estilo neo-skeuomorphic\n- DB: PostgreSQL serverless en Neon\n- Chat IA: Asistente contextual hiper-personalizado",
            'format' => 'markdown',
            'category' => 'work',
            'is_pinned' => true,
            'is_favorite' => true,
        ]);

        Note::create([
            'user_id' => $user->id,
            'title' => 'Ideas para Mejorar Hábitos de Estudio',
            'content' => "1. Usar bloques Pomodoro de 45 min foco + 10 min descanso.\n2. No estudiar con el teléfono visible.\n3. Repasar apuntes el mismo día de la clase.\n4. Hacer resúmenes visuales para cada parcial.",
            'format' => 'markdown',
            'category' => 'university',
            'is_pinned' => false,
            'is_favorite' => true,
        ]);

        // 7. Registro de tiempo (TimeTracking)
        TimeEntry::create([
            'user_id' => $user->id,
            'project_id' => $projectKronos->id,
            'task_id' => $task2->id,
            'description' => 'Desarrollo de módulos Core y Auth',
            'started_at' => Carbon::now()->subHours(3),
            'ended_at' => Carbon::now()->subHours(1),
            'duration_minutes' => 120,
        ]);

        // 8. Notificaciones
        UserNotification::create([
            'user_id' => $user->id,
            'type' => 'welcome',
            'title' => '¡Bienvenido a Kronos!',
            'body' => 'Tu espacio personal, académico y profesional está configurado y listo para optimizar tu tiempo.',
            'icon' => 'sparkles',
            'action_url' => '/dashboard',
            'read_at' => Carbon::now()->subMinutes(30),
        ]);

        UserNotification::create([
            'user_id' => $user->id,
            'type' => 'task_due',
            'title' => 'Tarea por vencer mañana',
            'body' => 'La tarea "Entregar informe de arquitectura modular" vence en menos de 24 horas.',
            'icon' => 'alert-circle',
            'action_url' => '/tasks',
        ]);

        // 9. Conversación con el Asistente IA
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => 'Organización Semanal y Plan de Estudio',
            'context' => [
                'user' => ['name' => $user->name, 'timezone' => $user->timezone],
                'note' => 'Conversación inicial de sincronización con Kronos AI',
            ],
        ]);

        $conversation->messages()->create([
            'role' => 'system',
            'content' => 'Eres Kronos AI, asistente de organización personal y académica.',
        ]);

        $conversation->messages()->create([
            'role' => 'user',
            'content' => 'Hola Kronos, tengo muchas cosas esta semana con la u y el trabajo, ¿cómo me recomiendas organizar mi tiempo para no sentirme abrumado?',
        ]);

        $conversation->messages()->create([
            'role' => 'assistant',
            'content' => "¡Hola Alfonso! Entiendo perfectamente esa sensación cuando se juntan entregas universitarias, proyectos de trabajo y vida personal. La clave no es hacer más horas, sino proteger tu energía con estructura clara:\n\n1. **Lo urgente primero:** Tu entrega de *Arquitectura de Software* vence mañana. Dedícale un bloque de alta concentración hoy de 2 horas sin distracciones.\n2. **Respeta tus clases:** Tienes clases clave de *Inteligencia Artificial* y *Arquitectura*. Esas horas son sagradas.\n3. **Proyectos:** Para *Kronos Platform*, avanza en pequeños sprints de 1 o 2 horas máximo por sesión.\n4. **Descanso no negociable:** Mantén tu rutina de entrenamiento y desconexión nocturna.\n\n¿Quieres que armemos el horario sugerido bloque por bloque para hoy y mañana?",
            'metadata' => [
                'model' => 'gpt-4o-mini',
                'tokens' => 240,
            ],
        ]);
    }
}
