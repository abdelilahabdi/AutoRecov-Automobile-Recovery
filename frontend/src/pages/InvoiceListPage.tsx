import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import { Card } from '../components/Card';
import PageHeader from '../components/PageHeader';
import {
    DataTable,
    DataTableColumn,
    EmptyState,
    FormField,
    inputCls,
    selectCls,
} from '../components/ui';
import { invoiceApi, InvoiceListParams } from '../services/api';
import { Invoice, InvoiceStatus, INVOICE_STATUSES, Paginated } from '../types';

export default function InvoiceListPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('');
    const [search, setSearch] = useState('');

    const load = async (status?: InvoiceStatus | '') => {
        setLoading(true);
        setError(null);
        try {
            const params: InvoiceListParams = {};
            const useStatus = status !== undefined ? status : filterStatus;
            if (useStatus) params.status = useStatus as InvoiceStatus;
            const page: Paginated<Invoice> = await invoiceApi.list(params);
            setInvoices(page.data);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? 'Failed to load invoices.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = invoices.filter((i) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (i.invoice_number ?? '').toLowerCase().includes(q) ||
            (i.description ?? '').toLowerCase().includes(q) ||
            (i.dossier?.case_number ?? '').toLowerCase().includes(q) ||
            (i.dossier?.client_name ?? '').toLowerCase().includes(q)
        );
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this invoice?')) return;
        try {
            await invoiceApi.remove(id);
            setInvoices((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to delete invoice.');
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const columns: DataTableColumn<Invoice>[] = [
        {
            key: 'num', header: 'Invoice #',
            render: (i) => (
                <Link to={`/invoices/${i.id}`} className="font-mono font-medium text-blue-700 hover:text-blue-900">
                    {i.invoice_number}
                </Link>
            ),
        },
        {
            key: 'dossier', header: 'Dossier',
            render: (i) => i.dossier ? (
                <Link to={`/dossiers/${i.dossier.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {i.dossier.case_number}
                </Link>
            ) : (
                <Link to={`/dossiers/${i.dossier_id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    #{i.dossier_id}
                </Link>
            ),
        },
        { key: 'amount', header: 'Amount', align: 'right', render: (i) => <span className="font-semibold text-slate-800">{i.amount.toFixed(2)} MAD</span> },
        { key: 'status', header: 'Status', render: (i) => <InvoiceStatusBadge status={i.status} /> },
        { key: 'issued', header: 'Issued', render: (i) => <span className="text-slate-500 text-xs">{i.issued_at ?? '—'}</span> },
        { key: 'paid', header: 'Paid', render: (i) => <span className="text-slate-500 text-xs">{i.paid_at ?? '—'}</span> },
        {
            key: 'act', header: '', align: 'right',
            render: (i) => (
                <div className="flex items-center justify-end gap-2">
                    <Link to={`/invoices/${i.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                        <EyeIcon className="h-3.5 w-3.5" /> View
                    </Link>
                    <button onClick={() => void handleDelete(i.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium">
                        <TrashIcon className="h-3.5 w-3.5" /> Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Invoices" description="All invoices across recovery cases" />

            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="Search" className="sm:col-span-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Invoice number, description, dossier or client…"
                            className={inputCls}
                        />
                    </FormField>
                    <FormField label="Status">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | '')}
                            className={selectCls}
                        >
                            <option value="">All statuses</option>
                            {INVOICE_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </Card>

            <Card padded={false}>
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Loading invoices…</div>
                ) : error ? (
                    <div className="p-6 text-red-600 text-sm">{error}</div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="No invoices found"
                        description="Try adjusting your filters or create a new invoice from a dossier."
                    />
                ) : (
                    <DataTable columns={columns} rows={filtered} rowKey={(i) => i.id} />
                )}
            </Card>
        </div>
    );
}
