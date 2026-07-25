import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    padded?: boolean;
}

export function Card({ children, className = '', padded = true }: CardProps) {
    return (
        <div
            className={[
                'bg-white border border-slate-200 rounded-xl shadow-sm',
                padded ? 'p-5' : '',
                className,
            ].join(' ')}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function CardHeader({ title, description, action, className = '' }: CardHeaderProps) {
    return (
        <div className={['flex items-start justify-between gap-3 mb-4', className].join(' ')}>
            <div>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                {description && (
                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
