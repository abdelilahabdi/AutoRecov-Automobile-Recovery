<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StageLogResource;
use App\Models\Dossier;
use App\Models\Notification;
use App\Models\StageLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StageLogController extends Controller
{
    public function index(Request $request, Dossier $dossier): AnonymousResourceCollection
    {
        $logs = $dossier->stageLogs()->with('performer')->latest()->paginate(15);
        return StageLogResource::collection($logs);
    }

    /**
     * Store a new stage log for the given dossier.
     * - Updates the dossier's `status` AND `current_stage` to the new stage.
     * - Records who performed the action.
     * - Auto-emits a notification.
     */
    public function store(Request $request, Dossier $dossier): JsonResponse
    {
        $data = $request->validate([
            'stage'  => ['required', 'in:open,inspection,towing,deposit,closed'],
            'notes'  => ['nullable', 'string', 'max:5000'],
        ]);

        $data['performed_by'] = $request->user()->id;

        // Mirror the new stage on the dossier itself.
        $dossier->update([
            'status'        => $data['stage'],
            'current_stage' => $data['stage'],
        ]);

        $log = $dossier->stageLogs()->create($data);

        // Emit a notification
        Notification::create([
            'user_id'    => $request->user()->id,
            'dossier_id' => $dossier->id,
            'type'       => 'stage_change',
            'title'      => 'Stage updated',
            'message'    => "Dossier {$dossier->case_number} moved to stage '{$data['stage']}'.",
        ]);

        return (new StageLogResource($log->load('performer')))
            ->additional([
                'status'  => 'success',
                'message' => 'Stage log created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }
}
