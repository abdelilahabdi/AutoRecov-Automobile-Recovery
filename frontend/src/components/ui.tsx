import { ReactNode } from 'react';

/* -------------------------------------------------------------------------- */
/*  Form Field                                                                */
/* -------------------------------------------------------------------------- */

interface FormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    hint?: string;
    error?: string;
    className?: string;
    children: ReactNode;
}

export function FormField({ label, htmlFor, required, hint, error, className = '', children }: FormFieldProps) {
    return (
        <div className={className}>
            <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-600 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Shared input/select/textarea class strings                                 */
/* -------------------------------------------------------------------------- */

export const inputCls =
    'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg ' +
    'shadow-sm placeholder:text-slate-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ' +
    'disabled:bg-slate-50 disabled:text-slate-500 transition';

export const selectCls = inputCls;

export const textareaCls = inputCls + ' resize-y';

/* -------------------------------------------------------------------------- */
/*  Buttons                                                                   */
/* -------------------------------------------------------------------------- */

export const primaryBtnCls =
    'inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 ' +
    'text-white text-sm font-semibold px-4 py-2 rounded-lg ' +
    'shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed ' +
    'transition focus:outline-none focus:ring-2 focus:ring-blue-500/40';

export const secondaryBtnCls =
    'inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 ' +
    'text-slate-700 text-sm font-medium px-4 py-2 rounded-lg ' +
    'border border-slate-300 shadow-sm transition ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/30';

export const dangerBtnCls =
    'inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 ' +
    'text-white text-sm font-semibold px-4 py-2 rounded-lg ' +
    'shadow-sm transition disabled:opacity-50';

export const ghostBtnCls =
    'inline-flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 ' +
    'hover:bg-slate-100 text-sm font-medium px-3 py-1.5 rounded-md transition';

/* -------------------------------------------------------------------------- */
/*  Banner / error                                                            */
/* -------------------------------------------------------------------------- */

export function ErrorBanner({ message }: { message?: string | null }) {
    if (!message) return null;
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {message}
        </div>
    );
}

export function InfoBanner({ message }: { message?: string | null }) {
    if (!message) return null;
    return (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-3 py-2">
            {message}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
    return (
        <div className="py-10 text-center">
            {icon && (
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    {icon}
                </div>
            )}
            <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
            {description && (
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Data table                                                                */
/* -------------------------------------------------------------------------- */

export interface DataTableColumn<T> {
    key: string;
    header: ReactNode;
    render: (row: T) => ReactNode;
    align?: 'left' | 'right' | 'center';
    className?: string;
    width?: string;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    empty?: ReactNode;
    onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, rows, rowKey, empty, onRowClick }: DataTableProps<T>) {
    if (rows.length === 0 && empty) {
        return <>{empty}</>;
    }
    return (
        <div className="overflow-x-auto -mx-5 sm:mx-0">
            <div className="inline-block min-w-full align-middle sm:px-0">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-y border-slate-200">
                            {columns.map((c) => (
                                <th
                                    key={c.key}
                                    style={c.width ? { width: c.width } : undefined}
                                    className={[
                                        'px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500',
                                        c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                                        c.className ?? '',
                                    ].join(' ')}
                                >
                                    {c.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row) => (
                            <tr
                                key={rowKey(row)}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                className={[
                                    'bg-white transition-colors',
                                    onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50',
                                ].join(' ')}
                            >
                                {columns.map((c) => (
                                    <td
                                        key={c.key}
                                        className={[
                                            'px-4 py-3 text-slate-700',
                                            c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                                            c.className ?? '',
                                        ].join(' ')}
                                    >
                                        {c.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Modal                                                                     */
/* -------------------------------------------------------------------------- */

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
    if (!open) return null;
    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={[
                    'relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden',
                    sizes[size],
                ].join(' ')}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 id="modal-title" className="text-base font-semibold text-slate-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-5 max-h-[calc(100vh-12rem)] overflow-y-auto">{children}</div>
                {footer && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
