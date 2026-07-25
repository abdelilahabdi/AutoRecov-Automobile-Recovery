<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'dossier_id'     => $this->dossier_id,
            'invoice_number' => $this->invoice_number,
            'amount'         => (float) $this->amount,
            'status'         => $this->status,
            'description'    => $this->description,
            'issued_at'      => $this->issued_at?->toDateString(),
            'paid_at'        => $this->paid_at?->toDateString(),
            'created_by'     => $this->created_by,
            'creator'        => $this->whenLoaded('creator', fn () => [
                'id'    => $this->creator->id,
                'name'  => $this->creator->name,
                'email' => $this->creator->email,
            ]),
            'dossier'        => $this->whenLoaded('dossier', fn () => [
                'id'          => $this->dossier->id,
                'case_number' => $this->dossier->case_number,
                'client_name' => $this->dossier->client_name,
            ]),
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
