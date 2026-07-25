<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    /** @use HasFactory<\Database\Factories\InvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'invoice_number',
        'amount',
        'status',
        'description',
        'issued_at',
        'paid_at',
        'created_by',
    ];

    protected $casts = [
        'amount'   => 'decimal:2',
        'issued_at'=> 'date',
        'paid_at'  => 'date',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
