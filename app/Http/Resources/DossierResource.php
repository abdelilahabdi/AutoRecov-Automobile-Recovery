<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DossierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'case_number'   => $this->case_number,
            'client_name'   => $this->client_name,
            'status'        => $this->status,
            'current_stage' => $this->current_stage ?? $this->status,
            'voitures'      => VoitureResource::collection($this->whenLoaded('voitures')),
            'stage_logs'    => $this->whenLoaded('stageLogs'),
            'attachments'   => $this->whenLoaded('attachments'),
            'invoices'      => $this->whenLoaded('invoices'),
            'created_at'    => $this->created_at?->toISOString(),
            'updated_at'    => $this->updated_at?->toISOString(),
        ];
    }
}
