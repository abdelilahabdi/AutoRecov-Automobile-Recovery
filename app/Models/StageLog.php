<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StageLog extends Model
{
    /** @use HasFactory<\Database\Factories\StageLogFactory> */
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'stage',
        'notes',
        'performed_by',
    ];

    /**
     * Get the dossier that owns the stage log.
     */
    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
