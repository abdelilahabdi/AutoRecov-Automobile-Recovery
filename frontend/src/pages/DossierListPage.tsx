import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { EyeIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../components/StatusBadge';
import { Card } from '../components/Card';
import PageHeader from '../components/PageHeader';
import {
    DataTable,
    DataTableColumn,
    EmptyState,
    ErrorBanner,
    FormField,
    Modal,
    inputCls,
    primaryBtnCls,
    secondaryBtnCls,
    selectCls,
} from '../components/ui';
import { dossierApi, CreateDossierPayload } from '../services/api';
import { Dossier, DossierStatus, DOSSIER_STATUSES, Paginated } from '../types';

export default function DossierListPage() {
    const navigate = useNavigate();
    const [dossiers, setDossiers] = useState<Dossier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<DossierStatus | ''>('');
    const [filterName, setFilterName] = useState('');

    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState<CreateDossierPayload>({
        case_number: '',
        client_name: '',
        status: 'open',
    });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: { status?: DossierStatus; client_name?: string } = {};
            if (filterStatus) params.status = filterStatus;
            if (filterName) params.client_name = filterName;
            const page: Paginated<Dossier> = await dossierApi.list(params);
            setDossiers(page.data);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? 'Failed to load dossiers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this dossier? This cannot be undone.')) return;
        try {
            await dossierApi.remove(id);
            setDossiers((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to delete dossier.');
        }
    };

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);
        try {
            const created = await dossierApi.create(form);
            setShowCreate(false);
            setForm({ case_number: '', client_name: '', status: 'open' });
            navigate(`/dossiers/${created.id}`);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            setCreateError(
                ax.response?.data?.message ??
                    (ax.response?.data?.errors
                        ? Object.values(ax.response.data.errors).flat().join(' ')
                        : null) ??
                    'Failed to create dossier.',
            );
        } finally {
            setCreating(false);
        }
    };

    const columns: DataTableColumn<Dossier>[] = [
        {
            key: 'cn', header: 'Case #',
            render: (d) => <span className="font-mono font-medium text-slate-800">{d.case_number}</span>,
        },
        { key: 'client', header: 'Client', render: (d) => <span className="text-slate-800">{d.client_name}</span> },
        { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
        {
            key: 'created', header: 'Created',
            render: (d) => <span className="text-slate-500 text-xs">{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</span>,
        },
        {
            key: 'act', header: '', align: 'right',
            render: (d) => (
                <div className="flex items-center justify-end gap-2">
                    <Link
                        to={`/dossiers/${d.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                        <EyeIcon className="h-3.5 w-3.5" /> View
                    </Link>
                    <button
                        onClick={() => void handleDelete(d.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                        <TrashIcon className="h-3.5 w-3.5" /> Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dossiers"
                description="All recovery cases"
                actions={
                    <button onClick={() => setShowCreate(true)} className={primaryBtnCls}>
                        <PlusIcon className="h-4 w-4" /> New Dossier
                    </button>
                }
            />

            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="Client name" className="sm:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') void load(); }}
                                placeholder="Search by name…"
                                className={[inputCls, 'pl-9'].join(' ')}
                            />
                        </div>
                    </FormField>
                    <FormField label="Status">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as DossierStatus | '')}
                            className={selectCls}
                        >
                            <option value="">All statuses</option>
                            {DOSSIER_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </Card>

            <Card padded={false}>
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Loading dossiers…</div>
                ) : error ? (
                    <div className="p-6 text-red-600 text-sm">{error}</div>
                ) : dossiers.length === 0 ? (
                    <EmptyState
                        title="No dossiers found"
                        description="Get started by creating your first recovery case."
                        action={
                            <button onClick={() => setShowCreate(true)} className={primaryBtnCls}>
                                <PlusIcon className="h-4 w-4" /> New Dossier
                            </button>
                        }
                    />
                ) : (
                    <DataTable columns={columns} rows={dossiers} rowKey={(d) => d.id} />
                )}
            </Card>

            <Modal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="New Dossier"
                footer={
                    <>
                        <button type="button" onClick={() => setShowCreate(false)} className={secondaryBtnCls}>Cancel</button>
                        <button type="submit" form="new-dossier-form" disabled={creating} className={primaryBtnCls}>
                            {creating ? 'Creating…' : 'Create'}
                        </button>
                    </>
                }
            >
                <form id="new-dossier-form" onSubmit={handleCreate} className="space-y-4">
                    <FormField label="Case number" required>
                        <input
                            type="text"
                            value={form.case_number}
                            onChange={(e) => setForm({ ...form, case_number: e.target.value })}
                            required
                            className={[inputCls, 'font-mono'].join(' ')}
                        />
                    </FormField>
                    <FormField label="Client name" required>
                        <input
                            type="text"
                            value={form.client_name}
                            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                            required
                            className={inputCls}
                        />
                    </FormField>
                    <FormField label="Status">
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value as DossierStatus })}
                            className={selectCls}
                        >
                            {DOSSIER_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </FormField>
                    <ErrorBanner message={createError} />
                </form>
            </Modal>
        </div>
    );
}
