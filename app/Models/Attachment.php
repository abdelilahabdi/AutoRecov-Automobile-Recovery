<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Attachment extends Model
{
    /** @use HasFactory<\Database\Factories\AttachmentFactory> */
    use HasFactory;

    protected $fillable = [
        'filename',
        'path',
        'attachable_id',
        'attachable_type',
    ];

    /**
     * Get the parent attachable model (Dossier or Voiture).
     */
    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
}
