import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
    ArrowLeftIcon,
    BanknotesIcon,
    CheckBadgeIcon,
    ClockIcon,
    PaperClipIcon,
    PlusIcon,
    TrashIcon,
    TruckIcon,
} from '@heroicons/react/24/outline';
import FileUpload from '../components/FileUpload';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import StatusBadge from '../components/StatusBadge';
import Stepper from '../components/Stepper';
import { Card, CardHeader } from '../components/Card';
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
    textareaCls,
} from '../components/ui';
import {
    attachmentApi,
    CreateInvoicePayload,
    CreateStageLogPayload,
    CreateVoiturePayload,
    dossierApi,
    invoiceApi,
    stageLogApi,
    voitureApi,
} from '../services/api';
import {
    Attachment,
    Dossier,
    DossierStatus,
    Invoice,
    StageLog,
    Voiture,
} from '../types';

type Tab = 'overview' | 'inspection' | 'towing' | 'deposit' | 'reporting' | 'invoicing' | 'timeline';

const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',   label: 'Overview' },
    { key: 'inspection', label: 'Inspection' },
    { key: 'towing',     label: 'Towing' },
    { key: 'deposit',    label: 'Deposit' },
    { key: 'reporting',  label: 'Reporting' },
    { key: 'invoicing',  label: 'Invoicing' },
    { key: 'timeline',   label: 'Timeline' },
];

export default function DossierDetailPage() {
    const { id } = useParams<{ id: string }>();
    const dossierId = Number(id);

    const [tab, setTab] = useState<Tab>('overview');

    const [dossier, setDossier] = useState<Dossier | null>(null);
    const [voitures, setVoitures] = useState<Voiture[]>([]);
    const [stageLogs, setStageLogs] = useState<StageLog[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [showVoitureForm, setShowVoitureForm] = useState(false);
    const [vForm, setVForm] = useState<CreateVoiturePayload>({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        chassis_number: '',
        plate_number: '',
    });
    const [vSubmitting, setVSubmitting] = useState(false);
    const [vError, setVError] = useState<string | null>(null);

    const [sForm, setSForm] = useState<CreateStageLogPayload>({ stage: 'open', notes: '' });
    const [sSubmitting, setSSubmitting] = useState(false);

    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [iForm, setIForm] = useState<CreateInvoicePayload>({
        dossier_id: dossierId,
        amount: 0,
        description: '',
        status: 'pending',
    });
    const [iSubmitting, setISubmitting] = useState(false);
    const [iError, setIError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const d = await dossierApi.get(dossierId);
            setDossier(d);
            if (d.voitures) setVoitures(d.voitures);
            else {
                const v = await voitureApi.listForDossier(dossierId);
                setVoitures(v.data);
            }
            try {
                const s = await stageLogApi.list(dossierId);
                setStageLogs(s.data);
            } catch { setStageLogs([]); }
            try {
                const a = await attachmentApi.list('dossier', dossierId);
                setAttachments(a.data);
            } catch { setAttachments([]); }
            try {
                const p = await invoiceApi.list({ dossier_id: dossierId });
                setInvoices(p.data);
            } catch { setInvoices([]); }
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? 'Failed to load dossier.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Number.isFinite(dossierId)) {
            void load();
            setIForm((f) => ({ ...f, dossier_id: dossierId }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dossierId]);

    const currentStage: DossierStatus = useMemo(
        () => (dossier?.current_stage ?? dossier?.status ?? 'open') as DossierStatus,
        [dossier],
    );

    const handleStageChange = async (stage: DossierStatus) => {
        if (!dossier || currentStage === stage) return;
        setUpdatingStatus(true);
        try {
            const updated = await dossierApi.update(dossier.id, { status: stage, current_stage: stage });
            setDossier(updated);
            const log = await stageLogApi.create(dossier.id, { stage, notes: null });
            setStageLogs((prev) => [log, ...prev]);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to update stage.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAddVoiture = async (e: FormEvent) => {
        e.preventDefault();
        setVSubmitting(true);
        setVError(null);
        try {
            const created = await voitureApi.create(dossierId, vForm);
            setVoitures((prev) => [created, ...prev]);
            setVForm({ make: '', model: '', year: new Date().getFullYear(), chassis_number: '', plate_number: '' });
            setShowVoitureForm(false);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            setVError(ax.response?.data?.message ??
                (ax.response?.data?.errors ? Object.values(ax.response.data.errors).flat().join(' ') : null) ??
                'Failed to add vehicle.');
        } finally {
            setVSubmitting(false);
        }
    };

    const handleDeleteVoiture = async (vId: number) => {
        if (!confirm('Delete this vehicle?')) return;
        try {
            await voitureApi.remove(vId);
            setVoitures((prev) => prev.filter((v) => v.id !== vId));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to delete vehicle.');
        }
    };

    const handleAddStageLog = async (e: FormEvent) => {
        e.preventDefault();
        setSSubmitting(true);
        try {
            const created = await stageLogApi.create(dossierId, sForm);
            setStageLogs((prev) => [created, ...prev]);
            setSForm({ stage: sForm.stage, notes: '' });
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to add stage log.');
        } finally {
            setSSubmitting(false);
        }
    };

    const handleDeleteAttachment = async (aId: number) => {
        if (!confirm('Delete this attachment?')) return;
        try {
            await attachmentApi.remove(aId);
            setAttachments((prev) => prev.filter((a) => a.id !== aId));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to delete attachment.');
        }
    };

    const refreshAttachments = async () => {
        try {
            const a = await attachmentApi.list('dossier', dossierId);
            setAttachments(a.data);
        } catch { /* ignore */ }
    };

    const handleCreateInvoice = async (e: FormEvent) => {
        e.preventDefault();
        setISubmitting(true);
        setIError(null);
        try {
            const created = await invoiceApi.create({
                ...iForm,
                dossier_id: dossierId,
                amount: Number(iForm.amount),
                description: iForm.description || null,
            });
            setInvoices((prev) => [created, ...prev]);
            setIForm({ dossier_id: dossierId, amount: 0, description: '', status: 'pending' });
            setShowInvoiceForm(false);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            setIError(ax.response?.data?.message ??
                (ax.response?.data?.errors ? Object.values(ax.response.data.errors).flat().join(' ') : null) ??
                'Failed to create invoice.');
        } finally {
            setISubmitting(false);
        }
    };

    const handleMarkInvoicePaid = async (id: number) => {
        try {
            const updated = await invoiceApi.update(id, { status: 'paid' });
            setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to mark invoice paid.');
        }
    };

    const handleDeleteInvoice = async (id: number) => {
        if (!confirm('Delete this invoice?')) return;
        try {
            await invoiceApi.remove(id);
            setInvoices((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to delete invoice.');
        }
    };

    if (loading) return <div className="text-slate-500">Loading dossier…</div>;

    if (error || !dossier) {
        return (
            <div className="space-y-3">
                <ErrorBanner message={error ?? 'Dossier not found.'} />
                <Link to="/dossiers" className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to dossiers
                </Link>
            </div>
        );
    }

    /* ------------------------------------------------------------------ */
    /*  Column definitions                                                 */
    /* ------------------------------------------------------------------ */
    const vehicleColumns: DataTableColumn<Voiture>[] = [
        { key: 'mm', header: 'Make / Model', render: (v) => <span className="font-medium text-slate-800">{v.make} {v.model}</span> },
        { key: 'year', header: 'Year', render: (v) => v.year },
        { key: 'plate', header: 'Plate', render: (v) => <span className="font-mono text-slate-700">{v.plate_number || '—'}</span> },
        { key: 'chassis', header: 'Chassis', render: (v) => <span className="font-mono text-slate-700">{v.chassis_number}</span> },
        {
            key: 'act', header: '', align: 'right', render: (v) => (
                <button
                    onClick={() => void handleDeleteVoiture(v.id)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium"
                >
                    <TrashIcon className="h-3.5 w-3.5" /> Delete
                </button>
            ),
        },
    ];

    const invoiceColumns: DataTableColumn<Invoice>[] = [
        { key: 'n', header: 'Invoice #', render: (i) => <span className="font-mono text-slate-800">{i.invoice_number}</span> },
        { key: 'a', header: 'Amount', align: 'right', render: (i) => <span className="font-semibold text-slate-800">{i.amount.toFixed(2)} MAD</span> },
        { key: 's', header: 'Status', render: (i) => <InvoiceStatusBadge status={i.status} /> },
        { key: 'd', header: 'Description', render: (i) => <span className="text-slate-500 text-xs">{i.description || '—'}</span> },
        {
            key: 'act', header: '', align: 'right', render: (i) => (
                <div className="flex items-center justify-end gap-2">
                    {i.status !== 'paid' && (
                        <button
                            onClick={() => void handleMarkInvoicePaid(i.id)}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                        >
                            <CheckBadgeIcon className="h-3.5 w-3.5" /> Mark paid
                        </button>
                    )}
                    <button
                        onClick={() => void handleDeleteInvoice(i.id)}
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
            <Link
                to="/dossiers"
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to dossiers
            </Link>

            <PageHeader
                title={`Dossier ${dossier.case_number}`}
                description={`Client: ${dossier.client_name}`}
                actions={<StatusBadge status={currentStage} className="text-sm px-3 py-1" />}
            />

            {/* Stepper */}
            <Card padded={false} className="px-4 sm:px-6 py-6">
                <Stepper
                    currentStage={currentStage}
                    onChange={(s) => void handleStageChange(s)}
                    disabled={updatingStatus}
                />
                {updatingStatus && (
                    <p className="mt-3 text-xs text-blue-600 text-center">
                        <ClockIcon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                        Updating stage…
                    </p>
                )}
            </Card>

            {/* Tabs */}
            <div className="border-b border-slate-200 overflow-x-auto">
                <nav className="flex gap-1 min-w-max">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={[
                                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap',
                                tab === t.key
                                    ? 'border-blue-600 text-blue-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
                            ].join(' ')}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>
            </div>

            {tab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader
                            title="Vehicles"
                            description="Linked to this dossier"
                            action={
                                <button onClick={() => setShowVoitureForm(true)} className={primaryBtnCls}>
                                    <PlusIcon className="h-4 w-4" /> Add vehicle
                                </button>
                            }
                        />
                        {voitures.length === 0 ? (
                            <EmptyState
                                icon={<TruckIcon className="h-6 w-6" />}
                                title="No vehicles linked"
                                description="Add a vehicle to this dossier to begin tracking its recovery."
                            />
                        ) : (
                            <DataTable
                                columns={vehicleColumns}
                                rows={voitures}
                                rowKey={(v) => v.id}
                            />
                        )}
                    </Card>

                    <Card>
                        <CardHeader title="Stage history" description="All updates recorded for this dossier" />

                        <form onSubmit={handleAddStageLog} className="space-y-3 mb-4">
                            <FormField label="Stage">
                                <select
                                    value={sForm.stage}
                                    onChange={(e) => setSForm({ ...sForm, stage: e.target.value as DossierStatus })}
                                    className={selectCls}
                                >
                                    {(['open', 'inspection', 'towing', 'deposit', 'closed'] as DossierStatus[]).map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="Notes">
                                <textarea
                                    value={sForm.notes ?? ''}
                                    onChange={(e) => setSForm({ ...sForm, notes: e.target.value })}
                                    placeholder="Add a note for this stage log…"
                                    rows={2}
                                    className={textareaCls}
                                />
                            </FormField>
                            <button type="submit" disabled={sSubmitting} className={primaryBtnCls + ' w-full'}>
                                {sSubmitting ? 'Saving...' : 'Add stage log'}
                            </button>
                        </form>

                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {stageLogs.length === 0 ? (
                                <p className="text-xs text-slate-500">No stage history yet.</p>
                            ) : (
                                stageLogs.map((log) => (
                                    <div key={log.id} className="border-l-4 border-blue-200 bg-slate-50 px-3 py-2 rounded-r-md">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <StatusBadge status={log.stage} />
                                            <span className="text-xs text-slate-500">
                                                {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                                            </span>
                                        </div>
                                        {log.performer && (
                                            <div className="text-xs text-slate-500 mb-1">
                                                by <span className="font-medium text-slate-700">{log.performer.name}</span>
                                                {log.performer.role && (
                                                    <span className="ml-1 inline-block bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold">
                                                        {log.performer.role}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {log.notes && <p className="text-sm text-slate-700">{log.notes}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'reporting' && (
                <Card>
                    <CardHeader title="Reporting" description="Summary of work performed across all stages." />
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {(['open', 'inspection', 'towing', 'deposit', 'closed'] as DossierStatus[]).map((s) => {
                            const count = stageLogs.filter((l) => l.stage === s).length;
                            return (
                                <div key={s} className="border border-slate-200 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-slate-800">{count}</div>
                                    <div className="text-xs text-slate-500 capitalize">{s}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-sm text-slate-600">
                        Attachments: <strong>{attachments.length}</strong> - Vehicles: <strong>{voitures.length}</strong>
                    </div>
                </Card>
            )}

            {tab === 'invoicing' && (
                <Card>
                    <CardHeader
                        title="Invoices"
                        description="Generate and track invoices for this dossier."
                        action={
                            <button onClick={() => setShowInvoiceForm(true)} className={primaryBtnCls}>
                                <PlusIcon className="h-4 w-4" /> New invoice
                            </button>
                        }
                    />

                    {invoices.length === 0 ? (
                        <EmptyState
                            icon={<BanknotesIcon className="h-6 w-6" />}
                            title="No invoices yet"
                            description="Create an invoice to bill your client for this dossier."
                        />
                    ) : (
                        <DataTable columns={invoiceColumns} rows={invoices} rowKey={(i) => i.id} />
                    )}
                </Card>
            )}

            {tab === 'timeline' && (
                <Card>
                    <CardHeader title="Timeline" description="All events recorded against this dossier, in reverse chronological order." />
                    {stageLogs.length === 0 ? (
                        <EmptyState title="No events yet" description="As the dossier progresses, the timeline will populate here." />
                    ) : (
                        <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                            {stageLogs.map((log) => (
                                <li key={log.id} className="ml-6">
                                    <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white bg-blue-100 text-blue-600 text-xs font-bold">-</span>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <StatusBadge status={log.stage} />
                                        <span className="text-xs text-slate-500">
                                            {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                                        </span>
                                    </div>
                                    {log.performer && (
                                        <div className="text-xs text-slate-500 mb-1">
                                            by <span className="font-medium text-slate-700">{log.performer.name}</span>
                                        </div>
                                    )}
                                    {log.notes && <p className="text-sm text-slate-700">{log.notes}</p>}
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>
            )}

            {(tab === 'inspection' || tab === 'towing' || tab === 'deposit') && (
                <StageTab
                    title={tab === 'inspection' ? 'Inspection' : tab === 'towing' ? 'Towing (Remorquage)' : 'Deposit (Depot)'}
                    subtitle={tab === 'inspection'
                        ? 'Inspection report - log the condition of the vehicle and findings.'
                        : tab === 'towing'
                        ? 'Tow from incident site to the deposit / impound lot.'
                        : 'Vehicle is stored at the deposit / impound lot.'}
                    stageName={tab}
                    currentStage={currentStage}
                    stageLogs={stageLogs.filter((l) => l.stage === tab)}
                    attachments={attachments}
                    onAdvance={() => {
                        const next: DossierStatus = tab === 'inspection' ? 'towing' : tab === 'towing' ? 'deposit' : 'closed';
                        void handleStageChange(next);
                    }}
                    onUploaded={refreshAttachments}
                    onDeleteAttachment={handleDeleteAttachment}
                />
            )}

            <Modal
                open={showVoitureForm}
                onClose={() => { setShowVoitureForm(false); setVError(null); }}
                title="Add vehicle"
                footer={
                    <>
                        <button type="button" onClick={() => { setShowVoitureForm(false); setVError(null); }} className={secondaryBtnCls}>Cancel</button>
                        <button type="submit" form="add-vehicle-form" disabled={vSubmitting} className={primaryBtnCls}>
                            {vSubmitting ? 'Saving...' : 'Save vehicle'}
                        </button>
                    </>
                }
            >
                <form id="add-vehicle-form" onSubmit={handleAddVoiture} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Make" required>
                        <input placeholder="e.g. Toyota" value={vForm.make} onChange={(e) => setVForm({ ...vForm, make: e.target.value })} required className={inputCls} />
                    </FormField>
                    <FormField label="Model" required>
                        <input placeholder="e.g. Corolla" value={vForm.model} onChange={(e) => setVForm({ ...vForm, model: e.target.value })} required className={inputCls} />
                    </FormField>
                    <FormField label="Year" required>
                        <input type="number" min={1900} max={new Date().getFullYear() + 1} value={vForm.year} onChange={(e) => setVForm({ ...vForm, year: Number(e.target.value) })} required className={inputCls} />
                    </FormField>
                    <FormField label="Plate number">
                        <input placeholder="12345-A-6" value={vForm.plate_number ?? ''} onChange={(e) => setVForm({ ...vForm, plate_number: e.target.value })} className={[inputCls, 'font-mono'].join(' ')} />
                    </FormField>
                    <FormField label="Chassis number" required className="sm:col-span-2">
                        <input placeholder="VIN / chassis" value={vForm.chassis_number} onChange={(e) => setVForm({ ...vForm, chassis_number: e.target.value })} required className={[inputCls, 'font-mono'].join(' ')} />
                    </FormField>
                    <ErrorBanner message={vError} />
                </form>
            </Modal>

            <Modal
                open={showInvoiceForm}
                onClose={() => { setShowInvoiceForm(false); setIError(null); }}
                title="New invoice"
                footer={
                    <>
                        <button type="button" onClick={() => { setShowInvoiceForm(false); setIError(null); }} className={secondaryBtnCls}>Cancel</button>
                        <button type="submit" form="add-invoice-form" disabled={iSubmitting} className={primaryBtnCls}>
                            {iSubmitting ? 'Saving...' : 'Create invoice'}
                        </button>
                    </>
                }
            >
                <form id="add-invoice-form" onSubmit={handleCreateInvoice} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Amount (MAD)" required>
                        <input type="number" min={0} step="0.01" value={iForm.amount} onChange={(e) => setIForm({ ...iForm, amount: Number(e.target.value) })} required className={inputCls} />
                    </FormField>
                    <FormField label="Status">
                        <select value={iForm.status ?? 'pending'} onChange={(e) => setIForm({ ...iForm, status: e.target.value as 'pending' | 'paid' | 'cancelled' })} className={selectCls}>
                            <option value="pending">pending</option>
                            <option value="paid">paid</option>
                            <option value="cancelled">cancelled</option>
                        </select>
                    </FormField>
                    <FormField label="Description" className="sm:col-span-2">
                        <textarea value={iForm.description ?? ''} onChange={(e) => setIForm({ ...iForm, description: e.target.value })} rows={3} className={textareaCls} />
                    </FormField>
                    <ErrorBanner message={iError} />
                </form>
            </Modal>
        </div>
    );
}

interface StageTabProps {
    title: string;
    subtitle: string;
    stageName: DossierStatus;
    currentStage: DossierStatus;
    stageLogs: StageLog[];
    attachments: Attachment[];
    onAdvance: () => void;
    onUploaded: () => void;
    onDeleteAttachment: (id: number) => void;
}

function StageTab({ title, subtitle, stageName, currentStage, stageLogs, attachments, onAdvance, onUploaded, onDeleteAttachment }: StageTabProps) {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isCurrent = currentStage === stageName;
    const order: DossierStatus[] = ['open', 'inspection', 'towing', 'deposit', 'closed'];
    const stageIdx = order.indexOf(currentStage);
    const isPast = stageIdx > order.indexOf(stageName);

    const handleLog = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await stageLogApi.create(stageLogs[0]?.dossier_id ?? 0, { stage: stageName, notes: note || null });
            setNote('');
            window.location.reload();
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to add log.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader
                title={title}
                description={subtitle}
                action={
                    isCurrent ? (
                        <button onClick={onAdvance} className={primaryBtnCls}>
                            Advance to next stage
                        </button>
                    ) : isPast ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200">
                            <CheckBadgeIcon className="h-3.5 w-3.5" /> Completed
                        </span>
                    ) : null
                }
            />

            <form onSubmit={handleLog} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 mb-5">
                <FormField label="Note">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={'Add a ' + title.toLowerCase() + ' note...'}
                        rows={2}
                        className={textareaCls}
                    />
                </FormField>
                <button type="submit" disabled={submitting} className={primaryBtnCls + ' w-full'}>
                    {submitting ? 'Saving...' : 'Log ' + title.toLowerCase()}
                </button>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Stage entries</h4>
                    {stageLogs.length === 0 ? (
                        <p className="text-xs text-slate-500">No entries for this stage yet.</p>
                    ) : (
                        <ol className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {stageLogs.map((log) => (
                                <li key={log.id} className="border-l-4 border-slate-200 bg-slate-50 px-3 py-2 rounded-r-md">
                                    <div className="text-xs text-slate-500">
                                        {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                                    </div>
                                    {log.performer && (
                                        <div className="text-xs text-slate-500">
                                            by <span className="font-medium">{log.performer.name}</span>
                                        </div>
                                    )}
                                    {log.notes && <p className="text-sm text-slate-700">{log.notes}</p>}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Photos and documents</h4>
                    <FileUpload ownerType="dossier" ownerId={stageLogs[0]?.dossier_id ?? 0} onUploaded={onUploaded} />
                    {attachments.length === 0 ? (
                        <p className="text-xs text-slate-500 mt-3">No attachments uploaded yet.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                            {attachments.map((a) => (
                                <li key={a.id} className="flex items-center justify-between px-3 py-2 text-sm bg-white">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <PaperClipIcon className="h-4 w-4 text-slate-400 shrink-0" />
                                        <a href={a.url ?? '#'} target="_blank" rel="noreferrer" className="truncate text-slate-700 hover:underline">
                                            {a.filename}
                                        </a>
                                    </div>
                                    <button onClick={() => onDeleteAttachment(a.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium shrink-0">
                                        <TrashIcon className="h-3.5 w-3.5" /> Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Card>
    );
}
