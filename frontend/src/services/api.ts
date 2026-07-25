import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
    Attachment,
    Dossier,
    DossierStatus,
    Invoice,
    InvoiceStatus,
    NotificationItem,
    Paginated,
    StageLog,
    Voiture,
} from '../types';

/**
 * Base URL of the Laravel API.
 *
 * The base URL is read from the `VITE_API_URL` environment variable
 * (see `frontend/.env`). It MUST end with `/api` (or be `/api` itself
 * for the Vite proxy flow). Every axios call below uses a leading-slash
 * relative path (`/login`, `/user`, …) which axios concatenates onto
 * the baseURL — so a request becomes:
 *
 *   POST  <baseURL>/register      (e.g. /api/register        via Vite proxy)
 *   POST  <baseURL>/login
 *   POST  <baseURL>/logout
 *   GET   <baseURL>/user
 *   ...
 *
 * Normalising logic:
 *   - undefined / empty / whitespace → fallback to `/api` (the relative
 *     path used by the Vite dev server's proxy).
 *   - value already ending with `/api` → kept as is.
 *   - value ending with `/` (but not `/api`) → `/api` is appended.
 *   - any other value → `/api` is appended. This guarantees the
 *     resulting baseURL always points at the API root and prevents the
 *     infamous `/api/api/login` double-prefix.
 */
const RAW_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE_URL = (() => {
    if (!RAW_BASE_URL) return '/api';
    if (RAW_BASE_URL.endsWith('/api')) return RAW_BASE_URL;
    return RAW_BASE_URL.replace(/\/+$/, '') + '/api';
})();

const TOKEN_STORAGE_KEY = 'auth_token';

/**
 * Event dispatched whenever the API rejects a request with 401 Unauthorized.
 * AuthContext subscribes to this so it can clear the in-memory user state in
 * addition to the localStorage token cleanup performed here.
 */
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export const getToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);
export const setToken = (token: string | null): void => {
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
};

/* -------------------------------------------------------------------------- */
/*  Axios instance                                                             */
/* -------------------------------------------------------------------------- */

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    // Bearer tokens travel in the `Authorization` header, so we do NOT
    // need to send cookies. Keeping `withCredentials: false` also avoids
    // a CORS preflight on every request.
    withCredentials: false,
});

/* -------------------------------------------------------------------------- */
/*  Request interceptor — attach Sanctum bearer token                         */
/* -------------------------------------------------------------------------- */

/**
 * Important: with axios 1.x `config.headers` is an instance of `AxiosHeaders`.
 * Calling `.set(...)` on it works for *re-setting* an existing header, but
 * when no `Authorization` header is present the request was occasionally
 * dispatched without one (random 401s on otherwise-valid requests).
 *
 * Using direct property assignment guarantees the header is always sent
 * for every protected request – fixing the "sometimes works, sometimes
 * doesn't" symptom on /api/user, /api/dossiers, etc.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
        // Use both the typed setter AND direct assignment for maximum
        // compatibility with axios 1.7.x.
        if (typeof (config.headers as any).set === 'function') {
            (config.headers as any).set('Authorization', `Bearer ${token}`);
        }
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
        (config.headers as any)['Accept'] = 'application/json';
    } else {
        // Even without a token, we always want a JSON response so that
        // 401/422 errors come back as parseable JSON, not HTML.
        if (typeof (config.headers as any).set === 'function') {
            (config.headers as any).set('Accept', 'application/json');
        }
        (config.headers as any)['Accept'] = 'application/json';
    }
    return config;
});

/* -------------------------------------------------------------------------- */
/*  Response interceptor — handle 401 globally                                */
/* -------------------------------------------------------------------------- */

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // 1) Wipe the persisted token so subsequent requests are unauthenticated.
            setToken(null);

            // 2) Notify the rest of the app (notably AuthContext) so in-memory
            //    user state can be cleared without relying on a hard reload.
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
            }

            // 3) Avoid an infinite redirect loop if /login itself returns 401
            //    (e.g. while the login form is submitting with bad credentials).
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterPayload extends AuthCredentials {
    name: string;
    password_confirmation: string;
    role?: 'admin' | 'agent';
}

export interface AuthResponse {
    status: string;
    message: string;
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            role?: 'admin' | 'agent';
        };
        token: string;
    };
}

export interface CreateDossierPayload {
    case_number: string;
    client_name: string;
    status?: DossierStatus;
    current_stage?: DossierStatus;
}

export interface UpdateDossierPayload {
    case_number?: string;
    client_name?: string;
    status?: DossierStatus;
    current_stage?: DossierStatus;
}

export interface CreateVoiturePayload {
    make: string;
    model: string;
    year: number;
    chassis_number: string;
    plate_number?: string | null;
}

export interface UpdateVoiturePayload {
    make?: string;
    model?: string;
    year?: number;
    chassis_number?: string;
    plate_number?: string | null;
}

export interface CreateStageLogPayload {
    stage: DossierStatus;
    notes?: string | null;
}

export interface CreateInvoicePayload {
    dossier_id: number;
    invoice_number?: string;
    amount: number;
    status?: InvoiceStatus;
    description?: string | null;
    issued_at?: string | null;
    paid_at?: string | null;
}

export interface UpdateInvoicePayload {
    invoice_number?: string;
    amount?: number;
    status?: InvoiceStatus;
    description?: string | null;
    issued_at?: string | null;
    paid_at?: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Auth API                                                                  */
/* -------------------------------------------------------------------------- */

export const authApi = {
    register: (payload: RegisterPayload) =>
        api.post<AuthResponse>('/register', payload).then((r) => r.data),

    login: (credentials: AuthCredentials) =>
        api.post<AuthResponse>('/login', credentials).then((r) => r.data),

    logout: () => api.post('/logout').then((r) => r.data),

    me: () => api.get('/user').then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Dossier API                                                               */
/* -------------------------------------------------------------------------- */

export interface DossierListParams {
    page?: number;
    status?: DossierStatus;
    current_stage?: DossierStatus;
    client_name?: string;
}

export const dossierApi = {
    list: (params: DossierListParams = {}) =>
        api.get<Paginated<Dossier>>('/dossiers', { params }).then((r) => r.data),

    get: (id: number) =>
        api.get<{ data: Dossier }>(`/dossiers/${id}`).then((r) => r.data.data),

    create: (payload: CreateDossierPayload) =>
        api.post<{ data: Dossier }>('/dossiers', payload).then((r) => r.data.data),

    update: (id: number, payload: UpdateDossierPayload) =>
        api.put<{ data: Dossier }>(`/dossiers/${id}`, payload).then((r) => r.data.data),

    remove: (id: number) =>
        api.delete(`/dossiers/${id}`).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Voiture API                                                               */
/* -------------------------------------------------------------------------- */

export interface VoitureListParams {
    page?: number;
    dossier_id?: number;
    make?: string;
    model?: string;
    plate_number?: string;
    chassis_number?: string;
}

export const voitureApi = {
    list: (params: VoitureListParams = {}) =>
        api.get<Paginated<Voiture>>('/voitures', { params }).then((r) => r.data),

    listForDossier: (dossierId: number) =>
        api
            .get<Paginated<Voiture>>(`/dossiers/${dossierId}/voitures`)
            .then((r) => r.data),

    create: (dossierId: number, payload: CreateVoiturePayload) =>
        api
            .post<{ data: Voiture }>(`/dossiers/${dossierId}/voitures`, payload)
            .then((r) => r.data.data),

    update: (voitureId: number, payload: UpdateVoiturePayload) =>
        api
            .put<{ data: Voiture }>(`/voitures/${voitureId}`, payload)
            .then((r) => r.data.data),

    remove: (voitureId: number) =>
        api.delete(`/voitures/${voitureId}`).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  StageLog API                                                              */
/* -------------------------------------------------------------------------- */

export const stageLogApi = {
    list: (dossierId: number) =>
        api
            .get<Paginated<StageLog>>(`/dossiers/${dossierId}/stage-logs`)
            .then((r) => r.data)
            .catch(
                () =>
                    ({
                        data: [],
                        current_page: 1,
                        last_page: 1,
                        per_page: 0,
                        total: 0,
                    }) as Paginated<StageLog>,
            ),

    create: (dossierId: number, payload: CreateStageLogPayload) =>
        api
            .post<{ data: StageLog }>(`/dossiers/${dossierId}/stage-logs`, payload)
            .then((r) => r.data.data),
};

/* -------------------------------------------------------------------------- */
/*  Invoice API                                                               */
/* -------------------------------------------------------------------------- */

export interface InvoiceListParams {
    page?: number;
    dossier_id?: number;
    status?: InvoiceStatus;
}

export const invoiceApi = {
    list: (params: InvoiceListParams = {}) =>
        api.get<Paginated<Invoice>>('/invoices', { params }).then((r) => r.data),

    get: (id: number) =>
        api.get<{ data: Invoice }>(`/invoices/${id}`).then((r) => r.data.data),

    create: (payload: CreateInvoicePayload) =>
        api.post<{ data: Invoice }>('/invoices', payload).then((r) => r.data.data),

    update: (id: number, payload: UpdateInvoicePayload) =>
        api.put<{ data: Invoice }>(`/invoices/${id}`, payload).then((r) => r.data.data),

    remove: (id: number) =>
        api.delete(`/invoices/${id}`).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Notification API                                                          */
/* -------------------------------------------------------------------------- */

export const notificationApi = {
    list: (unread = false) =>
        api
            .get<Paginated<NotificationItem>>('/notifications', {
                params: unread ? { unread: 1 } : undefined,
            })
            .then((r) => r.data)
            .catch(
                () =>
                    ({
                        data: [],
                        current_page: 1,
                        last_page: 1,
                        per_page: 0,
                        total: 0,
                    }) as Paginated<NotificationItem>,
            ),

    markRead: (id: number) =>
        api.post<{ data: NotificationItem }>(`/notifications/${id}/read`).then((r) => r.data.data),

    markAllRead: () => api.post('/notifications/mark-all-read').then((r) => r.data),

    remove: (id: number) => api.delete(`/notifications/${id}`).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Attachment API                                                            */
/* -------------------------------------------------------------------------- */

export const attachmentApi = {
    upload: (ownerType: 'dossier' | 'voiture', ownerId: number, file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api
            .post<{ data: Attachment }>(`/${ownerType}s/${ownerId}/attachments`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data.data);
    },

    list: (ownerType: 'dossier' | 'voiture', ownerId: number) =>
        api
            .get<Paginated<Attachment>>(`/${ownerType}s/${ownerId}/attachments`)
            .then((r) => r.data)
            .catch(
                () =>
                    ({
                        data: [],
                        current_page: 1,
                        last_page: 1,
                        per_page: 0,
                        total: 0,
                    }) as Paginated<Attachment>,
            ),

    remove: (id: number) => api.delete(`/attachments/${id}`).then((r) => r.data),
};

export default api;
