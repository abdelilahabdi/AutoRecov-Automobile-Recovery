<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StageLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'dossier_id'   => $this->dossier_id,
            'stage'        => $this->stage,
            'notes'        => $this->notes,
            'performed_by' => $this->performed_by,
            'performer'    => $this->whenLoaded('performer', fn () => [
                'id'    => $this->performer->id,
                'name'  => $this->performer->name,
                'email' => $this->performer->email,
                'role'  => $this->performer->role,
            ]),
            'created_at'   => $this->created_at?->toISOString(),
            'updated_at'   => $this->updated_at?->toISOString(),
        ];
    }
}
