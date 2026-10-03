<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class NotesApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_create_search_and_pin_notes(): void
    {
        $user = User::factory()->create();

        $createResponse = $this->actingAs($user, 'sanctum')->postJson('/api/v1/notes', [
            'title' => 'Estrategia de estudio para parciales',
            'content' => 'Método Feynman y active recall para algoritmos',
            'category' => 'university',
            'is_pinned' => true,
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Estrategia de estudio para parciales')
            ->assertJsonPath('data.isPinned', true);

        $noteId = $createResponse->json('data.id');

        // Búsqueda
        $searchResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notes?search=Feynman');
        $searchResponse->assertStatus(200);

        // Actualizar nota
        $updateResponse = $this->actingAs($user, 'sanctum')->putJson("/api/v1/notes/{$noteId}", [
            'is_favorite' => true,
        ]);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.isFavorite', true);

        // Eliminar nota
        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/notes/{$noteId}");
        $deleteResponse->assertStatus(200);
    }
}
