<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'dossier_id' => $this->dossier_id,
            'type'       => $this->type,
            'title'      => $this->title,
            'message'    => $this->message,
            'read_at'    => (bool) $this->read_at,
            'read_dt'    => $this->read_dt?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
