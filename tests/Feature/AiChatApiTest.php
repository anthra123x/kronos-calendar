<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AiChatApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_create_conversation_and_send_messages(): void
    {
        $user = User::factory()->create();

        // 1. Crear conversación
        $createResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/chat/conversations', [
            'title' => 'Plan de organización semanal',
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Plan de organización semanal');

        $conversationId = $createResponse->json('data.id');

        // 2. Enviar mensaje
        $msgResponse = $this->actingAs($user, 'sanctum')->postJson("/api/v1/chat/conversations/{$conversationId}/messages", [
            'message' => '¿Cómo me organizo hoy con mis clases de la tarde?',
        ]);

        $msgResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user_message' => ['id', 'role', 'content'],
                    'assistant_message' => ['id', 'role', 'content', 'metadata'],
                ],
            ]);

        // 3. Ver detalle con mensajes
        $showResponse = $this->actingAs($user, 'sanctum')->getJson("/api/v1/chat/conversations/{$conversationId}");
        $showResponse->assertStatus(200);

        // 4. Eliminar conversación
        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/chat/conversations/{$conversationId}");
        $deleteResponse->assertStatus(200);
    }
}
