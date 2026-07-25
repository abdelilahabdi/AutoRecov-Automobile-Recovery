import { ReactNode } from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';
import {
    BoltIcon,
    ChartBarIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

/* -------------------------------------------------------------------------- */
/*  Shared auth layout pieces                                                  */
/*                                                                            */
/*  These components exist solely to give the Login and Register pages a       */
/*  consistent, premium look-and-feel. They do NOT touch any auth logic,      */
/*  API calls, validation, the AuthContext, or backend code — they are        */
/*  pure presentation.                                                        */
/* -------------------------------------------------------------------------- */

interface FeatureItem {
    icon: ReactNode;
    iconBg: string;
    title: string;
    description: string;
}

const FEATURES: FeatureItem[] = [
    {
        icon: <ShieldCheckIcon className="h-5 w-5" />,
        iconBg: 'bg-blue-500/20 text-blue-200',
        title: 'Secure & Reliable',
        description: 'Your data is protected with enterprise-grade security.',
    },
    {
        icon: <BoltIcon className="h-5 w-5" />,
        iconBg: 'bg-blue-500/20 text-blue-200',
        title: 'Fast & Efficient',
        description: 'Manage your recovery cases with speed and efficiency.',
    },
    {
        icon: <ChartBarIcon className="h-5 w-5" />,
        iconBg: 'bg-blue-500/20 text-blue-200',
        title: 'Real-time Tracking',
        description: 'Stay updated with real-time notifications and updates.',
    },
];

/* -------------------------------------------------------------------------- */
/*  Lightweight SVG tow-truck illustration                                    */
/*  Pure inline SVG, no external assets. Sits at the bottom-left of the       */
/*  branding panel, like the reference image.                                 */
/* -------------------------------------------------------------------------- */

function TowTruckIllustration() {
    return (
        <svg
            viewBox="0 0 320 160"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-sm text-blue-300/80"
            aria-hidden="true"
        >
            {/* Decorative dotted route */}
            <path
                d="M10 60 Q 80 20 160 60 T 310 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 6"
                strokeLinecap="round"
                opacity="0.55"
            />

            {/* City skyline silhouette */}
            <g opacity="0.35" fill="currentColor">
                <rect x="170" y="20" width="14" height="55" rx="1" />
                <rect x="190" y="32" width="10" height="43" rx="1" />
                <rect x="206" y="14" width="16" height="61" rx="1" />
                <rect x="228" y="26" width="12" height="49" rx="1" />
                <rect x="246" y="38" width="10" height="37" rx="1" />
                <rect x="262" y="20" width="18" height="55" rx="1" />
                <rect x="286" y="34" width="12" height="41" rx="1" />
            </g>

            {/* Pin marker at end of route */}
            <g transform="translate(286 28)" fill="currentColor" opacity="0.9">
                <path d="M10 0c-5.5 0-10 4.5-10 10 0 7.5 10 18 10 18s10-10.5 10-18C20 4.5 15.5 0 10 0zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
            </g>

            {/* Tow truck body */}
            <g transform="translate(40 78)">
                {/* Truck cab */}
                <path
                    d="M0 18 L0 6 L36 6 L44 14 L60 14 L60 38 L0 38 Z"
                    fill="#dbeafe"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                {/* Windshield */}
                <path
                    d="M4 10 L34 10 L40 16 L4 16 Z"
                    fill="#2563eb"
                    opacity="0.85"
                />
                {/* Tow arm (boom) */}
                <path
                    d="M60 18 L122 4 L126 10 L64 26 Z"
                    fill="#bfdbfe"
                    stroke="#60a5fa"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                />
                {/* Car on tow */}
                <g transform="translate(78 18)">
                    <path
                        d="M0 14 L4 6 L24 4 L40 6 L46 14 L46 24 L0 24 Z"
                        fill="#3b82f6"
                        stroke="#1d4ed8"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M6 12 L10 8 L34 8 L40 12 Z"
                        fill="#bfdbfe"
                        opacity="0.9"
                    />
                </g>
                {/* Wheels */}
                <g fill="#0f172a">
                    <circle cx="14" cy="40" r="6" />
                    <circle cx="50" cy="40" r="6" />
                    <circle cx="92" cy="40" r="5" />
                </g>
                <g fill="#cbd5e1">
                    <circle cx="14" cy="40" r="2" />
                    <circle cx="50" cy="40" r="2" />
                    <circle cx="92" cy="40" r="1.6" />
                </g>
            </g>

            {/* Road */}
            <line
                x1="0"
                y1="128"
                x2="320"
                y2="128"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.45"
            />
            <line
                x1="0"
                y1="136"
                x2="320"
                y2="136"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="2 8"
                opacity="0.35"
            />
        </svg>
    );
}

/* -------------------------------------------------------------------------- */
/*  AuthBrandingPanel — the dark blue gradient side of the split layout       */
/* -------------------------------------------------------------------------- */

interface AuthBrandingPanelProps {
    title: string;
    subtitle: string;
}

export function AuthBrandingPanel({ title, subtitle }: AuthBrandingPanelProps) {
    return (
        <div
            className={[
                // Dark blue gradient that matches the dashboard's primary palette
                'relative hidden md:flex md:w-5/12 lg:w-1/2 flex-col',
                'bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800',
                'text-white p-8 lg:p-12 overflow-hidden',
            ].join(' ')}
        >
            {/* Soft glow accents */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
            />

            {/* Brand */}
            <div className="relative flex items-center gap-3 auth-fade-slide-right">
                <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <TruckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold leading-tight">AutoRecov</h1>
                    <p className="text-xs text-blue-200/80 leading-tight">Case Management</p>
                </div>
            </div>

            {/* Welcome copy */}
            <div className="relative mt-10 lg:mt-16 auth-fade-slide-right auth-stagger-1">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h2>
                <p className="mt-3 text-sm lg:text-base text-blue-100/80 max-w-md leading-relaxed">
                    {subtitle}
                </p>
            </div>

            {/* Feature blocks */}
            <ul className="relative mt-8 space-y-5 max-w-md">
                {FEATURES.map((feature, idx) => (
                    <li
                        key={feature.title}
                        className={[
                            'flex items-start gap-3.5 auth-fade-slide-right',
                            `auth-stagger-${idx + 2}`,
                        ].join(' ')}
                    >
                        <div
                            className={[
                                'h-10 w-10 shrink-0 rounded-xl flex items-center justify-center',
                                feature.iconBg,
                            ].join(' ')}
                        >
                            {feature.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{feature.title}</p>
                            <p className="text-xs text-blue-100/70 mt-0.5 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Illustration at the bottom-left */}
            <div className="relative mt-auto pt-10 auth-float-slow">
                <TowTruckIllustration />
            </div>

            {/* Footer copyright */}
            <div className="relative mt-6 text-[11px] text-blue-200/60 auth-fade-in">
                © {new Date().getFullYear()} AutoRecov. All rights reserved.
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  AuthShell — the white card wrapper used on the right side of the split    */
/* -------------------------------------------------------------------------- */

interface AuthShellProps {
    children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
    return (
        <div
            className={[
                'flex w-full md:w-7/12 lg:w-1/2 items-center justify-center',
                'p-4 sm:p-6 md:p-8 bg-slate-50',
            ].join(' ')}
        >
            <div className="w-full max-w-md">
                {/* Mobile brand — only visible below the `md` breakpoint */}
                <div className="md:hidden mb-6 flex items-center gap-2.5 auth-fade-slide-up">
                    <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <TruckIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-tight">
                            AutoRecov
                        </h1>
                        <p className="text-[11px] text-slate-500 leading-tight">Case Management</p>
                    </div>
                </div>

                <div
                    className={[
                        // White card with rounded corners + soft shadow + generous spacing
                        'bg-white rounded-3xl shadow-xl shadow-slate-900/5',
                        'border border-slate-200/70 p-7 sm:p-9',
                        'auth-fade-slide-left',
                    ].join(' ')}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  AuthLayout — the split-screen container used by Login + Register          */
/* -------------------------------------------------------------------------- */

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    return (
        <div
            className={[
                'min-h-screen flex flex-col md:flex-row bg-slate-50',
                'auth-fade-in',
            ].join(' ')}
        >
            <AuthBrandingPanel title={title} subtitle={subtitle} />
            <AuthShell>{children}</AuthShell>
        </div>
    );
}
