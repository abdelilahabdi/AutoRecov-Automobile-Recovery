/* -------------------------------------------------------------------------- */
/*  Domain types — mirror the Laravel API resources                            */
/* -------------------------------------------------------------------------- */

export type DossierStatus =
    | 'open'
    | 'inspection'
    | 'towing'
    | 'deposit'
    | 'closed';

export const DOSSIER_STATUSES: DossierStatus[] = [
    'open',
    'inspection',
    'towing',
    'deposit',
    'closed',
];

export const DOSSIER_STATUS_LABELS: Record<DossierStatus, string> = {
    open:       'Open / Created',
    inspection: 'Inspection',
    towing:     'Towing (Remorquage)',
    deposit:    'Deposit (Dépôt)',
    closed:     'Closed',
};

export interface User {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'agent';
}

export interface Dossier {
    id: number;
    case_number: string;
    client_name: string;
    status: DossierStatus;
    current_stage: DossierStatus;
    voitures?: Voiture[];
    stage_logs?: StageLog[];
    attachments?: Attachment[];
    invoices?: Invoice[];
    created_at?: string;
    updated_at?: string;
}

export interface Voiture {
    id: number;
    dossier_id: number;
    make: string;
    model: string;
    year: number;
    chassis_number: string;
    plate_number?: string | null;
    dossier?: Pick<Dossier, 'id' | 'case_number' | 'client_name'>;
    attachments?: Attachment[];
    created_at?: string;
    updated_at?: string;
}

export interface StageLog {
    id: number;
    dossier_id: number;
    stage: DossierStatus;
    notes: string | null;
    performed_by?: number | null;
    performer?: User;
    created_at?: string;
    updated_at?: string;
}

export interface Attachment {
    id: number;
    filename: string;
    path: string;
    url?: string | null;
    mime?: string | null;
    size?: number | null;
    attachable_id: number;
    attachable_type: string;
    created_at?: string;
    updated_at?: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'cancelled';

export const INVOICE_STATUSES: InvoiceStatus[] = ['pending', 'paid', 'cancelled'];

export interface Invoice {
    id: number;
    dossier_id: number;
    invoice_number: string;
    amount: number;
    status: InvoiceStatus;
    description: string | null;
    issued_at?: string | null;
    paid_at?: string | null;
    created_by?: number | null;
    creator?: User;
    dossier?: Pick<Dossier, 'id' | 'case_number' | 'client_name'>;
    created_at?: string;
    updated_at?: string;
}

export type NotificationType =
    | 'stage_change'
    | 'invoice_created'
    | 'invoice_paid'
    | 'new_attachment'
    | 'dossier_created'
    | string;

export interface NotificationItem {
    id: number;
    user_id: number | null;
    dossier_id: number | null;
    type: NotificationType;
    title: string;
    message: string;
    read_at: boolean;
    read_dt?: string | null;
    created_at?: string;
    updated_at?: string;
}

/* -------------------------------------------------------------------------- */
/*  Paginated response shape (Laravel default)                                 */
/* -------------------------------------------------------------------------- */

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: {
        first?: string;
        last?: string;
        prev?: string | null;
        next?: string | null;
    };
}
