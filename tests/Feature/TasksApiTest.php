<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TasksApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_create_list_and_complete_tasks(): void
    {
        $user = User::factory()->create();

        $createResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/tasks', [
            'title' => 'Entregar informe de laboratorio',
            'description' => 'Redactar conclusiones y bibliografía',
            'priority' => 'urgent',
            'category' => 'university',
            'due_date' => Carbon::now()->addDays(2)->toIso8601String(),
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Entregar informe de laboratorio')
            ->assertJsonPath('data.priority', 'urgent');

        $taskId = $createResponse->json('data.id');

        // Filtrar por prioridad
        $listResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/tasks?priority=urgent');
        $listResponse->assertStatus(200);

        // Completar tarea
        $completeResponse = $this->actingAs($user, 'sanctum')->putJson("/api/v1/tasks/{$taskId}", [
            'status' => 'completed',
        ]);

        $completeResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
        $this->assertNotNull($completeResponse->json('data.completedAt'));

        // Eliminar tarea
        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/tasks/{$taskId}");
        $deleteResponse->assertStatus(200);
    }
}
