<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Dossier extends Model
{
    /** @use HasFactory<\Database\Factories\DossierFactory> */
    use HasFactory;

    protected $fillable = [
        'case_number',
        'client_name',
        'status',
        'current_stage',
    ];

    /**
     * Get the voitures for the dossier.
     */
    public function voitures(): HasMany
    {
        return $this->hasMany(Voiture::class);
    }

    /**
     * Get the stage logs for the dossier.
     */
    public function stageLogs(): HasMany
    {
        return $this->hasMany(StageLog::class);
    }

    /**
     * Get all of the dossier's attachments.
     */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Get the invoices for the dossier.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the notifications for the dossier.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
