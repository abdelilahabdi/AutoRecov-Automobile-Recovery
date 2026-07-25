import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import { Card } from '../components/Card';
import PageHeader from '../components/PageHeader';
import {
    ErrorBanner,
    FormField,
    inputCls,
    primaryBtnCls,
    selectCls,
} from '../components/ui';
import { invoiceApi, UpdateInvoicePayload } from '../services/api';
import { Invoice, INVOICE_STATUSES, InvoiceStatus } from '../types';

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const invoiceId = Number(id);

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<UpdateInvoicePayload>({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const i = await invoiceApi.get(invoiceId);
            setInvoice(i);
            setForm({
                invoice_number: i.invoice_number,
                amount: i.amount,
                status: i.status,
                description: i.description ?? '',
                issued_at: i.issued_at ?? '',
                paid_at: i.paid_at ?? '',
            });
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? 'Failed to load invoice.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Number.isFinite(invoiceId)) void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoiceId]);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!invoice) return;
        setSaving(true);
        setSaveError(null);
        try {
            const payload: UpdateInvoicePayload = {
                invoice_number: form.invoice_number,
                amount: Number(form.amount),
                status: form.status,
                description: form.description || null,
                issued_at: form.issued_at || null,
                paid_at: form.paid_at || null,
            };
            const updated = await invoiceApi.update(invoice.id, payload);
            setInvoice(updated);
            setForm({
                invoice_number: updated.invoice_number,
                amount: updated.amount,
                status: updated.status,
                description: updated.description ?? '',
                issued_at: updated.issued_at ?? '',
                paid_at: updated.paid_at ?? '',
            });
        } catch (err) {
            const ax = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            setSaveError(
                ax.response?.data?.message ??
                (ax.response?.data?.errors
                    ? Object.values(ax.response.data.errors).flat().join(' ')
                    : null) ??
                'Failed to save invoice.',
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!invoice) return;
        if (!confirm('Delete this invoice?')) return;
        try {
            await invoiceApi.remove(invoice.id);
            navigate('/invoices');
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to delete invoice.');
        }
    };

    if (loading) return <div className="text-slate-500">Loading invoice…</div>;

    if (error || !invoice) {
        return (
            <div className="space-y-3">
                <ErrorBanner message={error ?? 'Invoice not found.'} />
                <Link to="/invoices" className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to invoices
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <Link to="/invoices" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to invoices
                </Link>
                <button onClick={handleDelete} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium">
                    <TrashIcon className="h-4 w-4" /> Delete invoice
                </button>
            </div>

            <PageHeader
                title={invoice.invoice_number}
                description={`Dossier: `}
                actions={<InvoiceStatusBadge status={invoice.status} className="text-sm px-3 py-1" />}
            />

            <p className="text-sm text-slate-600 -mt-4">
                Dossier:{' '}
                <Link to={`/dossiers/${invoice.dossier_id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {invoice.dossier?.case_number ?? `#${invoice.dossier_id}`}
                </Link>
            </p>

            <Card>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Invoice number">
                            <input value={form.invoice_number ?? ''} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} className={[inputCls, 'font-mono'].join(' ')} />
                        </FormField>
                        <FormField label="Amount (MAD)" required>
                            <input type="number" min={0} step="0.01" value={form.amount ?? 0} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required className={inputCls} />
                        </FormField>
                        <FormField label="Status">
                            <select value={form.status ?? 'pending'} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })} className={selectCls}>
                                {INVOICE_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Issued at">
                            <input type="date" value={form.issued_at ?? ''} onChange={(e) => setForm({ ...form, issued_at: e.target.value })} className={inputCls} />
                        </FormField>
                        <FormField label="Paid at">
                            <input type="date" value={form.paid_at ?? ''} onChange={(e) => setForm({ ...form, paid_at: e.target.value })} className={inputCls} />
                        </FormField>
                    </div>

                    <FormField label="Description">
                        <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} />
                    </FormField>

                    <ErrorBanner message={saveError} />

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={saving} className={primaryBtnCls}>
                            {saving ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </Card>

            <div className="text-xs text-slate-500">
                Created {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : '—'} - Last updated {invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : '—'}
            </div>
        </div>
    );
}
