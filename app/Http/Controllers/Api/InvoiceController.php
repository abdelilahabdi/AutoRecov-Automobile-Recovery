<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Dossier;
use App\Models\Invoice;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     * - If `dossier_id` is provided, scope to that dossier.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Invoice::query()->with(['dossier', 'creator']);

        if ($request->filled('dossier_id')) {
            $query->where('dossier_id', $request->integer('dossier_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $invoices = $query->latest()->paginate(15);

        return InvoiceResource::collection($invoices);
    }

    /**
     * Store a newly created invoice in storage.
     * Auto-generates a unique invoice number if the client didn't pass one.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'dossier_id'     => ['required', 'integer', 'exists:dossiers,id'],
            'invoice_number' => ['nullable', 'string', 'max:255', 'unique:invoices,invoice_number'],
            'amount'         => ['required', 'numeric', 'min:0'],
            'status'         => ['nullable', 'in:pending,paid,cancelled'],
            'description'    => ['nullable', 'string', 'max:5000'],
            'issued_at'      => ['nullable', 'date'],
            'paid_at'        => ['nullable', 'date'],
        ]);

        $data['invoice_number'] ??= 'INV-' . strtoupper(bin2hex(random_bytes(3)));
        $data['status']         ??= 'pending';
        $data['issued_at']      ??= now()->toDateString();
        $data['created_by']     = $request->user()->id;

        $invoice = Invoice::create($data);

        // Auto-create a notification
        Notification::create([
            'user_id'    => $request->user()->id,
            'dossier_id' => $invoice->dossier_id,
            'type'       => 'invoice_created',
            'title'      => 'Invoice generated',
            'message'    => "Invoice {$invoice->invoice_number} was created for dossier #{$invoice->dossier_id}.",
        ]);

        return (new InvoiceResource($invoice->load(['dossier', 'creator'])))
            ->additional([
                'status'  => 'success',
                'message' => 'Invoice created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice): InvoiceResource
    {
        $invoice->load(['dossier', 'creator']);
        return new InvoiceResource($invoice);
    }

    /**
     * Update the specified invoice (e.g. mark as paid).
     */
    public function update(Request $request, Invoice $invoice): InvoiceResource
    {
        $data = $request->validate([
            'invoice_number' => ['sometimes', 'required', 'string', 'max:255', 'unique:invoices,invoice_number,' . $invoice->id],
            'amount'         => ['sometimes', 'required', 'numeric', 'min:0'],
            'status'         => ['sometimes', 'required', 'in:pending,paid,cancelled'],
            'description'    => ['nullable', 'string', 'max:5000'],
            'issued_at'      => ['nullable', 'date'],
            'paid_at'        => ['nullable', 'date'],
        ]);

        // Auto-fill paid_at when status becomes 'paid'
        if (($data['status'] ?? null) === 'paid' && empty($data['paid_at']) && ! $invoice->paid_at) {
            $data['paid_at'] = now()->toDateString();
        }

        $invoice->update($data);

        // If the invoice transitioned to paid, log a notification
        if ($invoice->status === 'paid' && $invoice->wasChanged('status')) {
            Notification::create([
                'user_id'    => $request->user()->id,
                'dossier_id' => $invoice->dossier_id,
                'type'       => 'invoice_paid',
                'title'      => 'Invoice paid',
                'message'    => "Invoice {$invoice->invoice_number} was marked as paid.",
            ]);
        }

        return new InvoiceResource($invoice->fresh()->load(['dossier', 'creator']));
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Invoice deleted successfully.',
        ]);
    }
}
