import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowPathIcon,
    ArrowRightIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    TruckIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import {
    dossierApi,
    invoiceApi,
    notificationApi,
    voitureApi,
} from '../services/api';
import { DossierStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    trend?: { value: string; positive: boolean };
    to: string;
}

function StatCard({ title, value, icon, iconBg, iconColor, trend, to }: StatCardProps) {
    return (
        <Link
            to={to}
            className="group relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition p-5"
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
                        {value}
                    </p>
                    {trend && (
                        <div className="mt-2 flex items-center gap-1 text-xs">
                            <span
                                className={[
                                    'inline-flex items-center gap-0.5 font-semibold',
                                    trend.positive ? 'text-emerald-600' : 'text-red-600',
                                ].join(' ')}
                            >
                                <ArrowTrendingUpIcon
                                    className={[
                                        'h-3.5 w-3.5',
                                        trend.positive ? '' : 'rotate-180',
                                    ].join(' ')}
                                />
                                {trend.value}
                            </span>
                            <span className="text-slate-400">vs last month</span>
                        </div>
                    )}
                </div>
                <div
                    className={[
                        'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                        iconBg,
                        iconColor,
                    ].join(' ')}
                >
                    {icon}
                </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition">
                View details
                <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
            </div>
        </Link>
    );
}

function timeAgo(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso).getTime();
    const diff = Date.now() - d;
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return `${days}d ago`;
}

interface ActivityItem {
    id: string;
    type: 'stage' | 'invoice' | 'dossier' | 'attachment';
    title: string;
    description: string;
    timestamp: string;
    href?: string;
    status?: DossierStatus;
    invoiceStatus?: 'pending' | 'paid' | 'cancelled';
}

const ACTIVITY_ICONS: Record<ActivityItem['type'], { icon: React.ReactNode; bg: string; color: string }> = {
    stage:      { icon: <ClockIcon className="h-4 w-4" />,              bg: 'bg-blue-100',    color: 'text-blue-600' },
    invoice:    { icon: <BanknotesIcon className="h-4 w-4" />,         bg: 'bg-emerald-100', color: 'text-emerald-600' },
    dossier:    { icon: <DocumentTextIcon className="h-4 w-4" />,      bg: 'bg-violet-100',  color: 'text-violet-600' },
    attachment: { icon: <DocumentTextIcon className="h-4 w-4" />,      bg: 'bg-slate-100',   color: 'text-slate-600' },
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        towing: 0,
        pendingInspections: 0,
        paidInvoices: 0,
    });
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            // Run all fetches in parallel and tolerate individual failures
            const [dossiersRes, towingRes, paidInvoicesRes, recentRes, notificationsRes, vehiclesRes] =
                await Promise.allSettled([
                    dossierApi.list({ page: 1 }),
                    dossierApi.list({ status: 'towing', page: 1 }),
                    invoiceApi.list({ status: 'paid', page: 1 }),
                    dossierApi.list({ page: 1 }),
                    notificationApi.list(),
                    voitureApi.list({ page: 1 }),
                ]);

            const total = dossiersRes.status === 'fulfilled' ? (dossiersRes.value?.total ?? 0) : 0;
            const towing = towingRes.status === 'fulfilled' ? (towingRes.value?.total ?? 0) : 0;
            const paid = paidInvoicesRes.status === 'fulfilled' ? (paidInvoicesRes.value?.total ?? 0) : 0;

            // "Pending inspections" = dossiers currently in `inspection` stage
            let pendingInspections = 0;
            if (dossiersRes.status === 'fulfilled') {
                const dossiers = dossiersRes.value?.data ?? [];
                pendingInspections = dossiers.filter(
                    (d) => (d.current_stage ?? d.status) === 'inspection'
                ).length;
            }

            setStats({
                total,
                towing,
                pendingInspections,
                paidInvoices: paid,
            });

            // Build a unified recent activity list from the latest items.
            // Use optional chaining / fallback to [] everywhere so a partially
            // failed response (e.g. 401, 500, network error) cannot crash the UI.
            const items: ActivityItem[] = [];

            if (recentRes.status === 'fulfilled') {
                const recentDossiers = recentRes.value?.data ?? [];
                for (const d of recentDossiers.slice(0, 5)) {
                    if (!d) continue;
                    items.push({
                        id: `dossier-${d.id}`,
                        type: 'dossier',
                        title: `Dossier ${d.case_number}`,
                        description: `${d.client_name} • created`,
                        timestamp: d.created_at ?? '',
                        href: `/dossiers/${d.id}`,
                        status: d.current_stage ?? d.status,
                    });
                }
            }

            if (notificationsRes.status === 'fulfilled') {
                const notifs = notificationsRes.value?.data ?? [];
                for (const n of notifs.slice(0, 5)) {
                    if (!n) continue;
                    items.push({
                        id: `notif-${n.id}`,
                        type: 'stage',
                        title: n.title,
                        description: n.message,
                        timestamp: n.created_at ?? '',
                        href: n.dossier_id ? `/dossiers/${n.dossier_id}` : undefined,
                    });
                }
            }

            if (vehiclesRes.status === 'fulfilled') {
                const vehicles = vehiclesRes.value?.data ?? [];
                for (const v of vehicles.slice(0, 3)) {
                    if (!v) continue;
                    items.push({
                        id: `vehicle-${v.id}`,
                        type: 'attachment',
                        title: `Vehicle ${v.make} ${v.model}`,
                        description: `Plate ${v.plate_number ?? '—'} • added to dossier`,
                        timestamp: v.created_at ?? '',
                        href: v.dossier_id ? `/dossiers/${v.dossier_id}` : '/vehicles',
                    });
                }
            }

            // Sort by timestamp desc and take top 8
            items.sort((a, b) => {
                const ta = new Date(a.timestamp).getTime();
                const tb = new Date(b.timestamp).getTime();
                return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
            });

            setActivities(items.slice(0, 8));

            // If every single request failed, surface a non-blocking error
            const allFailed =
                dossiersRes.status === 'rejected' &&
                towingRes.status === 'rejected' &&
                paidInvoicesRes.status === 'rejected' &&
                recentRes.status === 'rejected' &&
                notificationsRes.status === 'rejected' &&
                vehiclesRes.status === 'rejected';
            if (allFailed) {
                setError('Unable to load dashboard data. Please check your connection and try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error loading dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋`}
                description="Here is what's happening with your recovery cases today."
                actions={
                    <Link
                        to="/dossiers"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-blue-600/20 transition"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New Dossier
                    </Link>
                }
            />

            {/* Error banner with retry — only shown when the load genuinely failed */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-800"
                >
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                        <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            void load();
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 shrink-0"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            )}

            {/* Full-page loading state — prevents rendering partial data and
                keeps the component from crashing while API data is in flight. */}
            {loading && (
                <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col items-center justify-center py-16 text-slate-500"
                >
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-3 text-sm font-medium">Loading dashboard…</p>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Dossiers"
                    value={loading ? '—' : stats.total.toLocaleString()}
                    icon={<DocumentTextIcon className="h-6 w-6" />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    trend={{ value: '+12%', positive: true }}
                    to="/dossiers"
                />
                <StatCard
                    title="Vehicles in Towing"
                    value={loading ? '—' : stats.towing.toLocaleString()}
                    icon={<TruckIcon className="h-6 w-6" />}
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                    trend={{ value: '+3%', positive: true }}
                    to="/dossiers?status=towing"
                />
                <StatCard
                    title="Pending Inspections"
                    value={loading ? '—' : stats.pendingInspections.toLocaleString()}
                    icon={<ClockIcon className="h-6 w-6" />}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    trend={{ value: '−5%', positive: false }}
                    to="/dossiers?status=inspection"
                />
                <StatCard
                    title="Paid Invoices"
                    value={loading ? '—' : stats.paidInvoices.toLocaleString()}
                    icon={<CheckCircleIcon className="h-6 w-6" />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    trend={{ value: '+8%', positive: true }}
                    to="/invoices?status=paid"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Latest status changes, dossiers and notifications.
                            </p>
                        </div>
                        <Link
                            to="/notifications"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View all
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-sm text-slate-500">
                            Loading recent activity…
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-500">
                            No recent activity yet.
                        </div>
                    ) : (
                        <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                            {activities.map((a) => {
                                const style = ACTIVITY_ICONS[a.type];
                                return (
                                    <li key={a.id} className="ml-6">
                                        <span
                                            className={[
                                                'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white',
                                                style.bg,
                                                style.color,
                                            ].join(' ')}
                                        >
                                            {style.icon}
                                        </span>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {a.title}
                                                    </p>
                                                    {a.status && <StatusBadge status={a.status} />}
                                                    {a.invoiceStatus && (
                                                        <InvoiceStatusBadge status={a.invoiceStatus} />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                    {a.description}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-slate-400">{timeAgo(a.timestamp)}</p>
                                                {a.href && (
                                                    <Link
                                                        to={a.href}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Open →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </Card>

                {/* Quick links / Pipeline status */}
                <Card>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">Pipeline</h3>
                    <p className="text-sm text-slate-500 mb-4">Dossiers by stage</p>

                    <ul className="space-y-3">
                        {(
                            [
                                { key: 'open',       label: 'Created',    color: 'bg-blue-500' },
                                { key: 'inspection', label: 'Inspection', color: 'bg-amber-500' },
                                { key: 'towing',     label: 'Towed',      color: 'bg-violet-500' },
                                { key: 'deposit',    label: 'Deposited',  color: 'bg-sky-500' },
                                { key: 'closed',     label: 'Invoiced',   color: 'bg-emerald-500' },
                            ] as { key: DossierStatus; label: string; color: string }[]
                        ).map((row) => (
                            <li key={row.key}>
                                <Link
                                    to={`/dossiers?status=${row.key}`}
                                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={['h-2.5 w-2.5 rounded-full', row.color].join(' ')} />
                                        <span className="text-sm font-medium text-slate-700">{row.label}</span>
                                    </div>
                                    <ArrowRightIcon className="h-4 w-4 text-slate-400" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <Link
                            to="/invoices"
                            className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                        >
                            <div className="flex items-center gap-3">
                                <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700">Manage invoices</span>
                            </div>
                            <ArrowRightIcon className="h-4 w-4 text-blue-600" />
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
