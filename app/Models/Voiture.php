<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Voiture extends Model
{
    /** @use HasFactory<\Database\Factories\VoitureFactory> */
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'make',
        'model',
        'year',
        'chassis_number',
        'plate_number',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    /**
     * Get the dossier that owns the voiture.
     */
    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    /**
     * Get all of the voiture's attachments.
     */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}
