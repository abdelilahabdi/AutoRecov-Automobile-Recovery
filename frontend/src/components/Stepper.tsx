import {
    CheckIcon,
    ClipboardDocumentCheckIcon,
    BuildingOffice2Icon,
    FolderPlusIcon,
    MagnifyingGlassIcon,
    TruckIcon,
} from '@heroicons/react/24/outline';
import { DossierStatus, DOSSIER_STATUSES, DOSSIER_STATUS_LABELS } from '../types';

const STAGE_ICONS: Record<DossierStatus, React.ComponentType<{ className?: string }>> = {
    open:       FolderPlusIcon,
    inspection: MagnifyingGlassIcon,
    towing:     TruckIcon,
    deposit:    BuildingOffice2Icon,
    closed:     ClipboardDocumentCheckIcon,
};

interface StepperProps {
    currentStage: DossierStatus;
    onChange?: (stage: DossierStatus) => void;
    disabled?: boolean;
}

/**
 * Horizontal stepper: Created → Inspected → Towed → Deposited → Invoiced
 * Each step is a button so a user with rights can move the dossier forward.
 */
export default function Stepper({ currentStage, onChange, disabled = false }: StepperProps) {
    const stageIndex = DOSSIER_STATUSES.indexOf(currentStage);

    return (
        <ol
            className="flex items-stretch w-full"
            aria-label="Dossier workflow"
        >
            {DOSSIER_STATUSES.map((stage, idx) => {
                const isDone   = idx < stageIndex;
                const isActive = idx === stageIndex;
                const isPending = idx > stageIndex;
                const Icon = STAGE_ICONS[stage];
                const isLast = idx === DOSSIER_STATUSES.length - 1;

                return (
                    <li
                        key={stage}
                        className={['flex-1 min-w-0 flex', isLast ? '' : 'items-center'].join(' ')}
                    >
                        <button
                            type="button"
                            disabled={disabled || isPending}
                            onClick={() => onChange?.(stage)}
                            className={[
                                'group flex flex-col items-center text-center w-full px-2 py-2 rounded-lg transition',
                                disabled || isPending ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'h-10 w-10 rounded-full flex items-center justify-center ring-4 transition',
                                    isDone
                                        ? 'bg-emerald-500 text-white ring-emerald-100'
                                        : isActive
                                        ? 'bg-blue-600 text-white ring-blue-100 shadow-lg shadow-blue-600/20'
                                        : 'bg-white text-slate-400 ring-slate-100 border border-slate-200',
                                ].join(' ')}
                            >
                                {isDone ? (
                                    <CheckIcon className="h-5 w-5" />
                                ) : (
                                    <Icon className="h-5 w-5" />
                                )}
                            </span>
                            <span
                                className={[
                                    'mt-2 text-xs font-semibold transition',
                                    isActive ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-500',
                                ].join(' ')}
                            >
                                {DOSSIER_STATUS_LABELS[stage]}
                            </span>
                            <span
                                className={[
                                    'text-[10px] uppercase tracking-wider font-medium mt-0.5',
                                    isActive ? 'text-blue-500' : isDone ? 'text-emerald-500' : 'text-slate-400',
                                ].join(' ')}
                            >
                                {isDone ? 'Completed' : isActive ? 'Current' : 'Pending'}
                            </span>
                        </button>

                        {!isLast && (
                            <div className="flex-1 h-0.5 mx-1 -mt-6 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={[
                                        'h-full transition-all',
                                        idx < stageIndex ? 'bg-emerald-500 w-full' : 'bg-slate-200 w-0',
                                    ].join(' ')}
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
