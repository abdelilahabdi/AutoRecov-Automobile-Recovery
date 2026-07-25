import { InvoiceStatus } from '../types';

/**
 * Invoice status palette:
 *  - pending   → Amber  (Pending action)
 *  - paid      → Emerald (Closed / success)
 *  - cancelled → Slate  (Neutral)
 */

const palette: Record<InvoiceStatus, { dot: string; bg: string; text: string; ring: string }> = {
    pending:   { dot: 'bg-amber-500',    bg: 'bg-amber-50',    text: 'text-amber-800',   ring: 'ring-amber-200' },
    paid:      { dot: 'bg-emerald-500',  bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-200' },
    cancelled: { dot: 'bg-slate-400',    bg: 'bg-slate-100',   text: 'text-slate-700',   ring: 'ring-slate-200' },
};

interface InvoiceStatusBadgeProps {
    status: InvoiceStatus;
    className?: string;
    showDot?: boolean;
}

export default function InvoiceStatusBadge({ status, className = '', showDot = true }: InvoiceStatusBadgeProps) {
    const c = palette[status];
    return (
        <span
            className={[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset capitalize',
                c.bg,
                c.text,
                c.ring,
                className,
            ].join(' ')}
        >
            {showDot && <span className={['h-1.5 w-1.5 rounded-full', c.dot].join(' ')} aria-hidden />}
            {status}
        </span>
    );
}
