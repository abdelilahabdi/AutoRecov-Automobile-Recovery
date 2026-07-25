import { NavLink } from 'react-router-dom';
import {
    ChartBarSquareIcon,
    Cog6ToothIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    HomeIcon,
    BellAlertIcon,
    TruckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const navItems = [
    { to: '/dashboard',     label: 'Dashboard',     icon: HomeIcon },
    { to: '/dossiers',      label: 'Dossiers',      icon: DocumentTextIcon },
    { to: '/vehicles',      label: 'Vehicles',      icon: TruckIcon },
    { to: '/invoices',      label: 'Invoices',      icon: CurrencyDollarIcon },
    { to: '/notifications', label: 'Notifications', icon: BellAlertIcon },
    { to: '/settings',      label: 'Settings',      icon: Cog6ToothIcon },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { user } = useAuth();

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    'fixed md:static inset-y-0 left-0 z-40 md:z-auto',
                    'w-64 bg-slate-900 text-slate-100 shrink-0 flex flex-col',
                    'transform transition-transform duration-200 ease-in-out',
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                ].join(' ')}
            >
                {/* Brand */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <TruckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-tight">AutoRecov</h1>
                            <p className="text-[11px] text-slate-400 leading-tight">Case Management</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
                        aria-label="Close menu"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    [
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group',
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                                    ].join(' ')
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className={[
                                                'h-5 w-5 shrink-0 transition',
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-slate-400 group-hover:text-white',
                                            ].join(' ')}
                                        />
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User card */}
                <div className="px-3 py-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                            {user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white truncate">
                                {user?.name ?? 'Guest'}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                                {user?.email ?? ''}
                            </div>
                        </div>
                    </div>
                    <div className="px-3 pt-2 text-[10px] text-slate-500 uppercase tracking-wider">
                        v1.0.0 · {user?.role ?? 'agent'}
                    </div>
                </div>
            </aside>
        </>
    );
}

/* Sidebar wrapper that hides itself visually but still takes the layout space on desktop */
export function SidebarSpacer() {
    return <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />;
}

export { ChartBarSquareIcon };
