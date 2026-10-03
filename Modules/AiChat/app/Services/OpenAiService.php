<?php

namespace Modules\AiChat\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiService
{
    /**
     * Send chat request to OpenAI / OpenRouter (or fallback mock if API key is not configured).
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{content: string, model: string, tokens: int}
     */
    public function chat(array $messages, string $systemPrompt): array
    {
        $apiKey = config('services.openai.api_key', env('OPENAI_API_KEY'));
        $model = config('services.openai.model', env('OPENAI_MODEL', 'openai/gpt-4o-mini'));

        if (empty($apiKey)) {
            return [
                'content' => '¡Hola! Soy tu asistente Kronos. Estoy conectado y listo para ayudarte a organizar tus horarios, tareas de la universidad y proyectos de trabajo. Para activar respuestas completas con modelo de lenguaje, asegúrate de configurar `OPENAI_API_KEY` en tu archivo `.env`.',
                'model' => 'kronos-assistant-demo',
                'tokens' => 50,
            ];
        }

        try {
            $isOpenRouter = str_starts_with($apiKey, 'sk-or-');
            $endpoint = $isOpenRouter
                ? 'https://openrouter.ai/api/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions';

            if ($isOpenRouter && ! str_contains($model, '/')) {
                $model = 'openai/'.$model;
            }

            $payload = [
                'model' => $model,
                'messages' => array_merge(
                    [['role' => 'system', 'content' => $systemPrompt]],
                    $messages
                ),
                'temperature' => 0.7,
                'max_tokens' => 1000,
            ];

            $headers = [];
            if ($isOpenRouter) {
                $headers['HTTP-Referer'] = config('app.url', 'https://kronos.app');
                $headers['X-Title'] = config('app.name', 'Kronos');
            }

            $response = Http::withToken($apiKey)
                ->withHeaders($headers)
                ->timeout(30)
                ->post($endpoint, $payload);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'content' => $data['choices'][0]['message']['content'] ?? 'Sin respuesta',
                    'model' => $data['model'] ?? $model,
                    'tokens' => $data['usage']['total_tokens'] ?? 0,
                ];
            }

            Log::error('AI API Error', ['body' => $response->body()]);

            return [
                'content' => 'Lo siento, hubo un problema al comunicarse con el proveedor de IA.',
                'model' => $model,
                'tokens' => 0,
            ];
        } catch (\Throwable $e) {
            Log::error('AI Service Exception: '.$e->getMessage());

            return [
                'content' => 'Error de conexión con el proveedor de inteligencia artificial: '.$e->getMessage(),
                'model' => $model,
                'tokens' => 0,
            ];
        }
    }
}
