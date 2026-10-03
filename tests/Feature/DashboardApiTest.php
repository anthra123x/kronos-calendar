<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/v1/dashboard');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_dashboard_summary(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'date' => ['current_iso', 'day_name', 'formatted', 'timezone'],
                    'counters' => [
                        'pending_tasks',
                        'completed_tasks_today',
                        'events_today',
                        'classes_today',
                        'unread_notifications',
                        'active_projects',
                    ],
                    'today_events',
                    'today_classes',
                    'urgent_tasks',
                    'active_projects',
                    'active_timer',
                ],
            ]);
    }
}
