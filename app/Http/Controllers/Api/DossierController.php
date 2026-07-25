<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DossierResource;
use App\Models\Dossier;
use App\Models\Notification;
use App\Models\StageLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DossierController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Dossier::query();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('current_stage')) {
            $query->where('current_stage', $request->string('current_stage'));
        }

        if ($request->filled('client_name')) {
            $query->where('client_name', 'like', '%' . $request->string('client_name') . '%');
        }

        $dossiers = $query->with('voitures')->latest()->paginate(15);

        return DossierResource::collection($dossiers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'case_number'   => ['required', 'string', 'max:255', 'unique:dossiers,case_number'],
            'client_name'   => ['required', 'string', 'max:255'],
            'status'        => ['nullable', 'in:open,inspection,towing,deposit,closed'],
            'current_stage' => ['nullable', 'in:open,inspection,towing,deposit,closed'],
        ]);

        $data['status']        ??= 'open';
        $data['current_stage'] ??= $data['status'];

        $dossier = Dossier::create($data);

        // Auto log the first stage
        StageLog::create([
            'dossier_id'   => $dossier->id,
            'stage'        => $dossier->status,
            'notes'        => 'Dossier created',
            'performed_by' => $request->user()->id,
        ]);

        // Auto-create notification
        Notification::create([
            'user_id'    => $request->user()->id,
            'dossier_id' => $dossier->id,
            'type'       => 'dossier_created',
            'title'      => 'New dossier created',
            'message'    => "Dossier {$dossier->case_number} was created for client {$dossier->client_name}.",
        ]);

        return (new DossierResource($dossier->load(['voitures', 'stageLogs'])))
            ->additional([
                'status'  => 'success',
                'message' => 'Dossier created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Dossier $dossier): DossierResource
    {
        $dossier->load(['voitures', 'stageLogs.performer', 'attachments', 'invoices']);
        return new DossierResource($dossier);
    }

    public function update(Request $request, Dossier $dossier): DossierResource
    {
        $data = $request->validate([
            'case_number'   => ['sometimes', 'required', 'string', 'max:255', 'unique:dossiers,case_number,' . $dossier->id],
            'client_name'   => ['sometimes', 'required', 'string', 'max:255'],
            'status'        => ['sometimes', 'required', 'in:open,inspection,towing,deposit,closed'],
            'current_stage' => ['sometimes', 'required', 'in:open,inspection,towing,deposit,closed'],
        ]);

        $dossier->update($data);

        return new DossierResource($dossier);
    }

    public function destroy(Dossier $dossier): JsonResponse
    {
        $dossier->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Dossier deleted successfully.',
        ]);
    }
}
