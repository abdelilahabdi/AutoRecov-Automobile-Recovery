import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { BellIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import PageHeader from '../components/PageHeader';
import { EmptyState, secondaryBtnCls } from '../components/ui';
import { notificationApi } from '../services/api';
import { NotificationItem } from '../types';

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

const iconFor = (type: string): string => {
    switch (type) {
        case 'stage_change':    return '🔄';
        case 'invoice_created': return '🧾';
        case 'invoice_paid':    return '✅';
        case 'new_attachment':  return '📎';
        case 'dossier_created': return '📁';
        default:                return '🔔';
    }
};

export default function NotificationListPage() {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const navigate = useNavigate();

    const load = async (unreadOnly?: boolean) => {
        setLoading(true);
        setError(null);
        try {
            const useUnread = unreadOnly !== undefined ? unreadOnly : filter === 'unread';
            const page = await notificationApi.list(useUnread);
            setItems(page.data);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? 'Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleMarkAll = async () => {
        try {
            await notificationApi.markAllRead();
            setItems((prev) => prev.map((n) => ({ ...n, read_at: true })));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to mark all read.');
        }
    };

    const handleMarkOne = async (id: number) => {
        try {
            await notificationApi.markRead(id);
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: true } : n)));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to mark notification read.');
        }
    };

    const handleOpen = (n: NotificationItem) => {
        void handleMarkOne(n.id);
        if (n.dossier_id) navigate(`/dossiers/${n.dossier_id}`);
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this notification?')) return;
        try {
            await notificationApi.remove(id);
            setItems((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            alert(ax.response?.data?.message ?? 'Failed to delete notification.');
        }
    };

    const unread = items.filter((n) => !n.read_at).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Notifications"
                description={unread > 0 ? `${unread} unread` : 'You are all caught up'}
                actions={
                    <>
                        <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden text-sm shadow-sm">
                            <button
                                onClick={() => setFilter('all')}
                                className={[
                                    'px-3 py-1.5 transition',
                                    filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50',
                                ].join(' ')}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={[
                                    'px-3 py-1.5 border-l border-slate-300 transition',
                                    filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50',
                                ].join(' ')}
                            >
                                Unread
                            </button>
                        </div>
                        <button
                            onClick={handleMarkAll}
                            className={secondaryBtnCls}
                            disabled={unread === 0}
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                            Mark all read
                        </button>
                    </>
                }
            />

            <Card padded={false}>
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Loading notifications…</div>
                ) : error ? (
                    <div className="p-6 text-red-600 text-sm">{error}</div>
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={<BellIcon className="h-6 w-6" />}
                        title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        description={filter === 'unread' ? 'You are all caught up.' : 'Notifications will appear here as your dossiers progress.'}
                    />
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {items.map((n) => (
                            <li
                                key={n.id}
                                className={[
                                    'flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition',
                                    !n.read_at ? 'bg-blue-50/40' : '',
                                ].join(' ')}
                            >
                                <div className="text-2xl shrink-0 mt-0.5">{iconFor(n.type)}</div>
                                <button
                                    onClick={() => handleOpen(n)}
                                    className="flex-1 min-w-0 text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold text-slate-800">{n.title}</div>
                                        {!n.read_at && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-600 mt-0.5">{n.message}</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {timeAgo(n.created_at)}
                                        {n.dossier_id && (
                                            <>
                                                {' · '}
                                                <Link
                                                    to={`/dossiers/${n.dossier_id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Open dossier
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => void handleDelete(n.id, e)}
                                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium shrink-0"
                                >
                                    <TrashIcon className="h-3.5 w-3.5" /> Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
