<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the current user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Notification::query()
            ->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                  ->orWhereNull('user_id'); // global ones
            });

        if ($request->boolean('unread')) {
            $query->where('read_at', false);
        }

        $notifications = $query->latest()->paginate(20);

        return NotificationResource::collection($notifications);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, Notification $notification): NotificationResource
    {
        if (! $notification->read_at) {
            $notification->update([
                'read_at' => true,
                'read_dt' => now(),
            ]);
        }
        return new NotificationResource($notification);
    }

    /**
     * Mark ALL notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                  ->orWhereNull('user_id');
            })
            ->where('read_at', false)
            ->update([
                'read_at' => true,
                'read_dt' => now(),
            ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Notification $notification): JsonResponse
    {
        $notification->delete();
        return response()->json([
            'status'  => 'success',
            'message' => 'Notification deleted.',
        ]);
    }
}
