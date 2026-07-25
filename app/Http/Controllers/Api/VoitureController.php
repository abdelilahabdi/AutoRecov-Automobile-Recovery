<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VoitureResource;
use App\Models\Dossier;
use App\Models\Voiture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VoitureController extends Controller
{
    /**
     * Display a paginated listing of voitures.
     * - If `dossier_id` is provided, scope to that dossier.
     * - Supports plate_number search and make/model filters.
     */
    public function index(Request $request, ?Dossier $dossier = null): AnonymousResourceCollection
    {
        $query = Voiture::query()->with('dossier');

        if ($dossier) {
            $query->where('dossier_id', $dossier->id);
        } elseif ($request->filled('dossier_id')) {
            $query->where('dossier_id', $request->integer('dossier_id'));
        }

        if ($request->filled('make')) {
            $query->where('make', 'like', '%' . $request->string('make') . '%');
        }
        if ($request->filled('model')) {
            $query->where('model', 'like', '%' . $request->string('model') . '%');
        }
        if ($request->filled('plate_number')) {
            $query->where('plate_number', 'like', '%' . $request->string('plate_number') . '%');
        }
        if ($request->filled('chassis_number')) {
            $query->where('chassis_number', 'like', '%' . $request->string('chassis_number') . '%');
        }

        $voitures = $query->latest()->paginate(15);

        return VoitureResource::collection($voitures);
    }

    public function store(Request $request, Dossier $dossier): JsonResponse
    {
        $data = $request->validate([
            'make'           => ['required', 'string', 'max:255'],
            'model'          => ['required', 'string', 'max:255'],
            'year'           => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'chassis_number' => ['required', 'string', 'max:255', 'unique:voitures,chassis_number'],
            'plate_number'   => ['nullable', 'string', 'max:32'],
        ]);

        $data['dossier_id'] = $dossier->id;

        $voiture = Voiture::create($data);

        return (new VoitureResource($voiture))
            ->additional([
                'status'  => 'success',
                'message' => 'Voiture created successfully for the dossier.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Dossier $dossier, Voiture $voiture): VoitureResource
    {
        abort_unless($voiture->dossier_id === $dossier->id, 404);
        $voiture->load('attachments');
        return new VoitureResource($voiture);
    }

    public function update(Request $request, Dossier $dossier, Voiture $voiture): VoitureResource
    {
        abort_unless($voiture->dossier_id === $dossier->id, 404);

        $data = $request->validate([
            'make'           => ['sometimes', 'required', 'string', 'max:255'],
            'model'          => ['sometimes', 'required', 'string', 'max:255'],
            'year'           => ['sometimes', 'required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'chassis_number' => ['sometimes', 'required', 'string', 'max:255', 'unique:voitures,chassis_number,' . $voiture->id],
            'plate_number'   => ['nullable', 'string', 'max:32'],
        ]);

        $voiture->update($data);

        return new VoitureResource($voiture);
    }

    public function destroy(Dossier $dossier, Voiture $voiture): JsonResponse
    {
        abort_unless($voiture->dossier_id === $dossier->id, 404);
        $voiture->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Voiture deleted successfully.',
        ]);
    }
}
