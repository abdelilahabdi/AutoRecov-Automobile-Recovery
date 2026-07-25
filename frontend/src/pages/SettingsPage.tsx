import { useState } from 'react';
import {
    BellIcon,
    CheckBadgeIcon,
    GlobeAltIcon,
    KeyIcon,
    PaintBrushIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader } from '../components/Card';
import PageHeader from '../components/PageHeader';
import { FormField, InfoBanner, inputCls, primaryBtnCls, selectCls } from '../components/ui';
import { useAuth } from '../context/AuthContext';

type Section = 'profile' | 'notifications' | 'security' | 'appearance' | 'preferences';

const SECTIONS: { key: Section; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    { key: 'profile',       label: 'Profile',       icon: UserCircleIcon, description: 'Your personal information' },
    { key: 'notifications', label: 'Notifications', icon: BellIcon,       description: 'Choose what we email you' },
    { key: 'security',      label: 'Security',      icon: KeyIcon,        description: 'Password and authentication' },
    { key: 'appearance',    label: 'Appearance',    icon: PaintBrushIcon, description: 'Theme and display options' },
    { key: 'preferences',   label: 'Preferences',   icon: GlobeAltIcon,   description: 'Localization and time zone' },
];

export default function SettingsPage() {
    const { user } = useAuth();
    const [section, setSection] = useState<Section>('profile');

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your account and application preferences"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card padded={false} className="lg:col-span-1 p-2">
                    <nav className="space-y-0.5">
                        {SECTIONS.map((s) => {
                            const Icon = s.icon;
                            return (
                                <button
                                    key={s.key}
                                    onClick={() => setSection(s.key)}
                                    className={[
                                        'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition',
                                        section === s.key
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-slate-700 hover:bg-slate-50',
                                    ].join(' ')}
                                >
                                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                                    <div>
                                        <div>{s.label}</div>
                                        <div className="text-[11px] text-slate-500 font-normal">{s.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </Card>

                <div className="lg:col-span-3 space-y-6">
                    {section === 'profile' && (
                        <Card>
                            <CardHeader title="Profile information" description="Update your personal details" />
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div>
                                    <div className="text-base font-semibold text-slate-900">{user?.name}</div>
                                    <div className="text-sm text-slate-500">{user?.email}</div>
                                    {user?.role && (
                                        <span className="mt-1 inline-block bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider">
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Full name">
                                    <input defaultValue={user?.name ?? ''} className={inputCls} />
                                </FormField>
                                <FormField label="Email address">
                                    <input type="email" defaultValue={user?.email ?? ''} className={inputCls} />
                                </FormField>
                                <FormField label="Phone number">
                                    <input type="tel" placeholder="+212 6XX-XXXXXX" className={inputCls} />
                                </FormField>
                                <FormField label="Role">
                                    <input value={user?.role ?? 'agent'} disabled className={[inputCls, 'capitalize'].join(' ')} />
                                </FormField>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition">
                                    Cancel
                                </button>
                                <button className={primaryBtnCls}>
                                    <CheckBadgeIcon className="h-4 w-4" />
                                    Save changes
                                </button>
                            </div>
                        </Card>
                    )}

                    {section === 'notifications' && (
                        <Card>
                            <CardHeader title="Notification preferences" description="Choose what we email you about" />
                            <InfoBanner message="Email notifications are sent to the address associated with your account." />
                            <ul className="mt-4 divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                                {[
                                    { label: 'Dossier stage changes',     desc: 'When a dossier moves to a new stage',     on: true },
                                    { label: 'New invoices',              desc: 'When an invoice is created for a dossier', on: true },
                                    { label: 'Invoice paid',              desc: 'When an invoice is marked as paid',       on: true },
                                    { label: 'New attachments',           desc: 'When a file is uploaded to a dossier',    on: false },
                                    { label: 'Weekly summary',            desc: 'A digest of your week every Monday',       on: false },
                                ].map((row, i) => (
                                    <li key={i} className="flex items-center justify-between p-4 bg-white">
                                        <div>
                                            <div className="text-sm font-medium text-slate-800">{row.label}</div>
                                            <div className="text-xs text-slate-500">{row.desc}</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={row.on} className="sr-only peer" />
                                            <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition relative">
                                                <div className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition" />
                                            </div>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {section === 'security' && (
                        <Card>
                            <CardHeader title="Security" description="Manage your password" />
                            <div className="space-y-4 max-w-md">
                                <FormField label="Current password" required>
                                    <input type="password" autoComplete="current-password" className={inputCls} />
                                </FormField>
                                <FormField label="New password" required hint="At least 8 characters">
                                    <input type="password" autoComplete="new-password" className={inputCls} />
                                </FormField>
                                <FormField label="Confirm new password" required>
                                    <input type="password" autoComplete="new-password" className={inputCls} />
                                </FormField>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button className={primaryBtnCls}>Update password</button>
                            </div>
                        </Card>
                    )}

                    {section === 'appearance' && (
                        <Card>
                            <CardHeader title="Appearance" description="Customize how the app looks" />
                            <div className="space-y-4 max-w-md">
                                <FormField label="Theme">
                                    <select className={selectCls} defaultValue="system">
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="system">Match system</option>
                                    </select>
                                </FormField>
                                <FormField label="Accent color">
                                    <div className="flex gap-2">
                                        {['blue', 'violet', 'emerald', 'amber', 'rose'].map((c) => (
                                            <button
                                                key={c}
                                                title={c}
                                                className={[
                                                    'h-8 w-8 rounded-full ring-2 ring-offset-2 transition',
                                                    c === 'blue'    ? 'bg-blue-500 ring-blue-500' :
                                                    c === 'violet'  ? 'bg-violet-500 ring-transparent hover:ring-violet-500' :
                                                    c === 'emerald' ? 'bg-emerald-500 ring-transparent hover:ring-emerald-500' :
                                                    c === 'amber'   ? 'bg-amber-500 ring-transparent hover:ring-amber-500' :
                                                                     'bg-rose-500 ring-transparent hover:ring-rose-500',
                                                ].join(' ')}
                                            />
                                        ))}
                                    </div>
                                </FormField>
                                <FormField label="Density">
                                    <select className={selectCls} defaultValue="comfortable">
                                        <option value="comfortable">Comfortable</option>
                                        <option value="compact">Compact</option>
                                    </select>
                                </FormField>
                            </div>
                        </Card>
                    )}

                    {section === 'preferences' && (
                        <Card>
                            <CardHeader title="Preferences" description="Localization and time zone" />
                            <div className="space-y-4 max-w-md">
                                <FormField label="Language">
                                    <select className={selectCls} defaultValue="en">
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                        <option value="ar">العربية</option>
                                    </select>
                                </FormField>
                                <FormField label="Time zone">
                                    <select className={selectCls} defaultValue="Africa/Casablanca">
                                        <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                                        <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                                        <option value="UTC">UTC (GMT+0)</option>
                                    </select>
                                </FormField>
                                <FormField label="Date format">
                                    <select className={selectCls} defaultValue="dmy">
                                        <option value="dmy">DD/MM/YYYY</option>
                                        <option value="mdy">MM/DD/YYYY</option>
                                        <option value="ymd">YYYY-MM-DD</option>
                                    </select>
                                </FormField>
                                <FormField label="Currency">
                                    <select className={selectCls} defaultValue="MAD">
                                        <option value="MAD">MAD — Moroccan Dirham</option>
                                        <option value="EUR">EUR — Euro</option>
                                        <option value="USD">USD — US Dollar</option>
                                    </select>
                                </FormField>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
