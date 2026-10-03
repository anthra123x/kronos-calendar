<?php

namespace Modules\AiChat\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\AiChat\Http\Requests\SendMessageRequest;
use Modules\AiChat\Http\Resources\ConversationResource;
use Modules\AiChat\Http\Resources\MessageResource;
use Modules\AiChat\Models\Conversation;
use Modules\AiChat\Services\AiContextService;
use Modules\AiChat\Services\OpenAiService;
use Modules\Core\Traits\ApiResponse;

class ConversationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly OpenAiService $openAiService,
        private readonly AiContextService $contextService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $conversations = $request->user()
            ->conversations()
            ->withCount('messages')
            ->orderByDesc('updated_at')
            ->paginate(20);

        return $this->paginatedResponse($conversations);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $conversation->load('messages');

        return $this->successResponse(new ConversationResource($conversation));
    }

    public function sendMessage(SendMessageRequest $request, Conversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        // Guardar mensaje del usuario
        $userMessage = $conversation->messages()->create([
            'role' => 'user',
            'content' => $request->message,
        ]);

        // Construir historial de mensajes para OpenAI
        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn ($msg) => ['role' => $msg->role, 'content' => $msg->content])
            ->toArray();

        // Obtener contexto del usuario (tareas pendientes, eventos próximos)
        $systemPrompt = $this->contextService->buildSystemPrompt($request->user());

        // Llamar a OpenAI
        $aiResponse = $this->openAiService->chat($messages, $systemPrompt);

        // Guardar respuesta del asistente
        $assistantMessage = $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $aiResponse['content'],
            'metadata' => [
                'model' => $aiResponse['model'],
                'tokens' => $aiResponse['tokens'],
            ],
        ]);

        // Actualizar timestamp de la conversación
        $conversation->touch();

        return $this->successResponse([
            'user_message' => new MessageResource($userMessage),
            'assistant_message' => new MessageResource($assistantMessage),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $context = $this->contextService->buildContext($request->user());

        $conversation = $request->user()->conversations()->create([
            'title' => $request->input('title'),
            'context' => $context,
        ]);

        // Mensaje de sistema inicial
        $conversation->messages()->create([
            'role' => 'system',
            'content' => $this->contextService->buildSystemPrompt($request->user()),
        ]);

        return $this->createdResponse(new ConversationResource($conversation));
    }

    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $conversation->delete();

        return $this->successResponse(null, 'Conversación eliminada');
    }
}
