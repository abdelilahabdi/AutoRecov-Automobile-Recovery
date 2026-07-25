<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'filename'        => $this->filename,
            'path'            => $this->path,
            'url'             => $this->path ? asset('storage/' . ltrim($this->path, '/')) : null,
            'mime'            => $this->mime ?? null,
            'size'            => $this->size ?? null,
            'attachable_id'   => $this->attachable_id,
            'attachable_type' => $this->attachable_type,
            'created_at'      => $this->created_at?->toISOString(),
            'updated_at'      => $this->updated_at?->toISOString(),
        ];
    }
}
