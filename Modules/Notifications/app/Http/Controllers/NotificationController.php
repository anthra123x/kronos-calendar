<?php

namespace Modules\Notifications\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Traits\ApiResponse;
use Modules\Notifications\Http\Resources\NotificationResource;
use Modules\Notifications\Models\UserNotification;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->userNotifications();

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->orderByDesc('created_at')->paginate(20);

        return $this->paginatedResponse($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->userNotifications()
            ->whereNull('read_at')
            ->count();

        return $this->successResponse(['unread_count' => $count]);
    }

    public function markAsRead(Request $request, UserNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $notification->update(['read_at' => now()]);

        return $this->successResponse(new NotificationResource($notification), 'Notificación marcada como leída');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->userNotifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->successResponse(null, 'Todas las notificaciones marcadas como leídas');
    }

    public function destroy(Request $request, UserNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->errorResponse('No autorizado', 403);
        }

        $notification->delete();

        return $this->successResponse(null, 'Notificación eliminada');
    }
}
