<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Nuevo Usuario',
            'email' => 'nuevo@kronos.app',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'timezone' => 'America/Bogota',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'name', 'email', 'timezone'],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'nuevo@kronos.app']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'login@kronos.app',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@kronos.app',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => ['user', 'token'],
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'valid@kronos.app']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'valid@kronos.app',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create(['bio' => 'Old bio']);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/v1/auth/profile', [
            'name' => 'Nombre Actualizado',
            'bio' => 'Nueva biografía de estudiante',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Nombre Actualizado')
            ->assertJsonPath('data.bio', 'Nueva biografía de estudiante');
    }
}
