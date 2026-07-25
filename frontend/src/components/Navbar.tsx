import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    BellIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
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

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unread = items.filter((n) => !n.read_at).length;

    const load = async () => {
        setLoading(true);
        try {
            const page = await notificationApi.list();
            setItems(page.data);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            console.error(ax.response?.data?.message ?? 'Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        void load();
        const id = setInterval(() => void load(), 60_000); // refresh every minute
        return () => clearInterval(id);
    }, [isAuthenticated]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100"
                    aria-label="Open menu"
                >
                    <Bars3Icon className="h-5 w-5" />
                </button>
                <div className="hidden md:block text-sm text-slate-500">
                    Automobile Recovery <span className="text-slate-300 mx-1.5">/</span>{' '}
                    <span className="text-slate-700 font-medium">Case Management</span>
                </div>
            </div>

            {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Notification bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen((o) => !o)}
                            className="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                            aria-label="Notifications"
                        >
                            <BellIcon className="h-5 w-5" />
                            {unread > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-white">
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-900/10 z-30 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                                    <div className="text-sm font-semibold text-slate-700">Notifications</div>
                                    <button
                                        onClick={handleMarkAll}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                        disabled={unread === 0}
                                    >
                                        Mark all read
                                    </button>
                                </div>

                                <div className="max-h-96 overflow-y-auto">
                                    {loading && items.length === 0 ? (
                                        <div className="p-4 text-sm text-slate-500 text-center">Loading…</div>
                                    ) : items.length === 0 ? (
                                        <div className="p-6 text-sm text-slate-500 text-center">
                                            No notifications yet.
                                        </div>
                                    ) : (
                                        items.map((n) => (
                                            <button
                                                key={n.id}
                                                onClick={() => {
                                                    void handleMarkOne(n.id);
                                                    if (n.dossier_id) {
                                                        setOpen(false);
                                                        navigate(`/dossiers/${n.dossier_id}`);
                                                    }
                                                }}
                                                className={[
                                                    'w-full text-left flex items-start gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition',
                                                    !n.read_at ? 'bg-blue-50/40' : '',
                                                ].join(' ')}
                                            >
                                                <div className="text-xl shrink-0 mt-0.5">{iconFor(n.type)}</div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-semibold text-slate-800 truncate">
                                                            {n.title}
                                                        </div>
                                                        {!n.read_at && (
                                                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                                        {n.message}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-1">
                                                        {timeAgo(n.created_at)}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-center">
                                    <Link
                                        to="/notifications"
                                        onClick={() => setOpen(false)}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View all notifications →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-slate-800 leading-tight">{user?.name}</div>
                        <div className="text-xs text-slate-500 leading-tight">
                            {user?.email} {user?.role && (
                                <span className="ml-1 inline-block bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider">
                                    {user.role}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                        {user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="hidden sm:inline-flex items-center gap-1.5 text-sm bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 px-3 py-1.5 rounded-md transition font-medium"
                        title="Log out"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="sm:hidden p-2 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="Log out"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                <div className="text-sm text-slate-500">Not signed in</div>
            )}
        </header>
    );
}

// Helper to keep the unused import from being tree-shaken in some configs
export { CheckIcon };
