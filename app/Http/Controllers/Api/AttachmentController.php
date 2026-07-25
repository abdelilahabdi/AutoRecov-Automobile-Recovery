<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttachmentResource;
use App\Models\Attachment;
use App\Models\Dossier;
use App\Models\Notification;
use App\Models\Voiture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AttachmentController extends Controller
{
    private const OWNER_MODELS = [
        'dossier' => Dossier::class,
        'voiture' => Voiture::class,
    ];

    public function index(Request $request, string $ownerType, int $ownerId): AnonymousResourceCollection
    {
        [$model, $relation] = $this->resolveOwner($ownerType);
        /** @var \Illuminate\Database\Eloquent\Model $owner */
        $owner = $model::findOrFail($ownerId);
        $attachments = $owner->{$relation}()->latest()->paginate(15);
        return AttachmentResource::collection($attachments);
    }

    public function store(Request $request, string $ownerType, int $ownerId): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
        ]);

        $type = $ownerType;
        [$model, $relation] = $this->resolveOwner($type);
        /** @var \Illuminate\Database\Eloquent\Model $owner */
        $owner = $model::findOrFail($ownerId);

        $file = $request->file('file');
        $path = $file->store("attachments/{$type}/{$ownerId}", 'public');

        $attachment = $owner->{$relation}()->create([
            'filename' => $file->getClientOriginalName(),
            'path'     => $path,
            'mime'     => $file->getClientMimeType(),
            'size'     => $file->getSize(),
        ]);

        // Emit notification
        Notification::create([
            'user_id'    => $request->user()->id,
            'dossier_id' => $owner instanceof Dossier ? $owner->id : optional($owner->dossier)->id,
            'type'       => 'new_attachment',
            'title'      => 'New attachment',
            'message'    => "File '{$file->getClientOriginalName()}' was attached.",
        ]);

        return (new AttachmentResource($attachment))
            ->additional([
                'status'  => 'success',
                'message' => 'Attachment uploaded successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Attachment $attachment): JsonResponse
    {
        if ($attachment->path) {
            Storage::disk('public')->delete($attachment->path);
        }
        $attachment->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Attachment deleted successfully.',
        ]);
    }

    /**
     * @return array{0: class-string<\Illuminate\Database\Eloquent\Model>, 1: string}
     */
    private function resolveOwner(string $ownerType): array
    {
        if (! isset(self::OWNER_MODELS[$ownerType])) {
            abort(404, "Unknown owner type '{$ownerType}'.");
        }
        return [self::OWNER_MODELS[$ownerType], 'attachments'];
    }
}
