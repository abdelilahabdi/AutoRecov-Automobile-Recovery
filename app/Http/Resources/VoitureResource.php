<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoitureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'dossier_id'     => $this->dossier_id,
            'make'           => $this->make,
            'model'          => $this->model,
            'year'           => $this->year,
            'chassis_number' => $this->chassis_number,
            'plate_number'   => $this->plate_number,
            'dossier'        => $this->whenLoaded('dossier', fn () => [
                'id'          => $this->dossier->id,
                'case_number' => $this->dossier->case_number,
                'client_name' => $this->dossier->client_name,
            ]),
            'attachments'    => $this->whenLoaded('attachments'),
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
