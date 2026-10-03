<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CalendarApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_create_and_list_calendar_events(): void
    {
        $user = User::factory()->create();

        $createResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/events', [
            'title' => 'Reunión de Coordinación',
            'description' => 'Discutir entregables',
            'starts_at' => Carbon::now()->addDay()->setTime(14, 0)->toIso8601String(),
            'ends_at' => Carbon::now()->addDay()->setTime(15, 30)->toIso8601String(),
            'category' => 'work',
            'color' => '#6366F1',
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Reunión de Coordinación')
            ->assertJsonPath('data.category', 'work');

        $eventId = $createResponse->json('data.id');

        $listResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/events');
        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // Actualizar
        $updateResponse = $this->actingAs($user, 'sanctum')->putJson("/api/v1/events/{$eventId}", [
            'title' => 'Reunión de Coordinación - Actualizada',
        ]);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.title', 'Reunión de Coordinación - Actualizada');

        // Eliminar
        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/events/{$eventId}");
        $deleteResponse->assertStatus(200);
    }
}
