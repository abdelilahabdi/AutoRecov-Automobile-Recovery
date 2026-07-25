import { DossierStatus, DOSSIER_STATUS_LABELS } from '../types';

/**
 * Status palette:
 *  - open       → Blue    (Created / In progress)
 *  - inspection → Amber   (In progress)
 *  - towing     → Violet  (In progress)
 *  - deposit    → Sky     (In progress)
 *  - closed     → Emerald (Closed)
 */

const palette: Record<DossierStatus, { dot: string; bg: string; text: string; ring: string }> = {
    open:       { dot: 'bg-blue-500',     bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-200' },
    inspection: { dot: 'bg-amber-500',    bg: 'bg-amber-50',    text: 'text-amber-800',   ring: 'ring-amber-200' },
    towing:     { dot: 'bg-violet-500',   bg: 'bg-violet-50',   text: 'text-violet-700',  ring: 'ring-violet-200' },
    deposit:    { dot: 'bg-sky-500',      bg: 'bg-sky-50',      text: 'text-sky-700',     ring: 'ring-sky-200' },
    closed:     { dot: 'bg-emerald-500',  bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-200' },
};

interface StatusBadgeProps {
    status: DossierStatus;
    className?: string;
    showDot?: boolean;
}

export default function StatusBadge({ status, className = '', showDot = true }: StatusBadgeProps) {
    const c = palette[status];
    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset',
                c.bg,
                c.text,
                c.ring,
                className,
            ].join(' ')}
        >
            {showDot && <span className={['h-1.5 w-1.5 rounded-full', c.dot].join(' ')} aria-hidden />}
            {DOSSIER_STATUS_LABELS[status]}
        </span>
    );
}
