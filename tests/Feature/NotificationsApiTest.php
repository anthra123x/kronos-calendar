<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Modules\Notifications\Models\UserNotification;
use Tests\TestCase;

class NotificationsApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_view_and_manage_notifications(): void
    {
        $user = User::factory()->create();

        $notif1 = UserNotification::create([
            'user_id' => $user->id,
            'type' => 'reminder',
            'title' => 'Entrega de Parcial',
            'body' => 'Recuerda subir tu archivo hoy',
        ]);

        $notif2 = UserNotification::create([
            'user_id' => $user->id,
            'type' => 'event',
            'title' => 'Reunión en 15 minutos',
        ]);

        // 1. Contador de no leídas
        $countResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifications/unread-count');
        $countResponse->assertStatus(200)
            ->assertJsonPath('data.unread_count', 2);

        // 2. Marcar una como leída
        $readResponse = $this->actingAs($user, 'sanctum')->postJson("/api/v1/notifications/{$notif1->id}/read");
        $readResponse->assertStatus(200)
            ->assertJsonPath('data.isRead', true);

        // 3. Marcar todas como leídas
        $allReadResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/notifications/mark-all-read');
        $allReadResponse->assertStatus(200);

        // 4. Contador debe ser 0
        $newCount = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifications/unread-count');
        $newCount->assertStatus(200)
            ->assertJsonPath('data.unread_count', 0);
    }
}
