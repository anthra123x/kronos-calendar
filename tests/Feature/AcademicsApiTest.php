<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AcademicsApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_manage_periods_subjects_schedules_and_grades(): void
    {
        $user = User::factory()->create();

        // 1. Crear Período
        $periodResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/academics/periods', [
            'name' => '2026-2',
            'starts_at' => Carbon::now()->startOfMonth()->format('Y-m-d'),
            'ends_at' => Carbon::now()->addMonths(4)->endOfMonth()->format('Y-m-d'),
            'is_current' => true,
        ]);

        $periodResponse->assertStatus(201);
        $periodId = $periodResponse->json('data.id');

        // 2. Crear Materia
        $subjectResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/academics/subjects', [
            'academic_period_id' => $periodId,
            'name' => 'Computación Cuántica',
            'code' => 'CQ-101',
            'professor' => 'Dr. Bohr',
            'classroom' => 'Auditorio 2',
            'color' => '#3B82F6',
            'credits' => 4,
        ]);

        $subjectResponse->assertStatus(201)
            ->assertJsonPath('data.name', 'Computación Cuántica');
        $subjectId = $subjectResponse->json('data.id');

        // 3. Crear Horario de Clase
        $scheduleResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/academics/schedules', [
            'subject_id' => $subjectId,
            'day_of_week' => 'tuesday',
            'starts_at' => '14:00',
            'ends_at' => '16:00',
            'classroom' => 'Auditorio 2',
        ]);

        $scheduleResponse->assertStatus(201);

        // 4. Consultar Horario Semanal
        $weeklyResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/academics/schedules/weekly');
        $weeklyResponse->assertStatus(200)
            ->assertJsonStructure(['data' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']]);

        // 5. Agregar Calificación
        $gradeResponse = $this->actingAs($user, 'sanctum')->postJson("/api/v1/academics/subjects/{$subjectId}/grades", [
            'name' => 'Taller 1: Qubits',
            'score' => 4.8,
            'max_score' => 5.0,
            'weight' => 20.0,
            'date' => Carbon::now()->format('Y-m-d'),
        ]);

        $gradeResponse->assertStatus(201)
            ->assertJsonPath('data.score', 4.8);

        // 6. Verificar que el Subject calcula el promedio
        $subjectDetail = $this->actingAs($user, 'sanctum')->getJson("/api/v1/academics/subjects/{$subjectId}");
        $subjectDetail->assertStatus(200)
            ->assertJsonPath('data.weightedAverage', 4.8);
    }
}
