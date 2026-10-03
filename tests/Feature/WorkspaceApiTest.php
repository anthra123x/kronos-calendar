<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class WorkspaceApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_manage_projects_and_timetracking(): void
    {
        $user = User::factory()->create();

        // 1. Crear Proyecto
        $projectResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/workspace/projects', [
            'name' => 'Backend API Kronos',
            'description' => 'Desarrollo de monolito modular',
            'color' => '#6366F1',
            'status' => 'active',
            'deadline' => Carbon::now()->addMonth()->format('Y-m-d'),
        ]);

        $projectResponse->assertStatus(201)
            ->assertJsonPath('data.name', 'Backend API Kronos');
        $projectId = $projectResponse->json('data.id');

        // 2. Iniciar Timer de Timetracking
        $timerResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/workspace/time-entries', [
            'project_id' => $projectId,
            'description' => 'Escribiendo controladores y tests',
            'started_at' => Carbon::now()->subMinutes(45)->toIso8601String(),
        ]);

        $timerResponse->assertStatus(201);
        $timerId = $timerResponse->json('data.id');

        // 3. Consultar timer en ejecución
        $runningResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/workspace/time-entries/running');
        $runningResponse->assertStatus(200)
            ->assertJsonPath('data.id', $timerId);

        // 4. Detener timer
        $stopResponse = $this->actingAs($user, 'sanctum')->postJson("/api/v1/workspace/time-entries/{$timerId}/stop");
        $stopResponse->assertStatus(200);
        $this->assertNotNull($stopResponse->json('data.endedAt'));
        $this->assertGreaterThan(0, $stopResponse->json('data.durationMinutes'));
    }
}
