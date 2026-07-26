import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
    ArrowRightCircleIcon,
    EnvelopeIcon,
    ExclamationCircleIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { AuthField, PasswordField } from '../components/AuthField';

/**
 * Extract a meaningful, user-facing error message from an axios error.
 *
 * The previous implementation only looked at the JSON body returned by
 * the API, which produced the misleading "Login failed. Please check
 * your credentials." text whenever the request never reached the
 * server (CORS, network, server down, etc.). We now distinguish:
 *  - validation errors from the API (use the first one we find),
 *  - 401/422 with a JSON body,
 *  - genuine network / CORS / DNS failures (axios sets
 *    `error.response === undefined` in those cases).
 */
function extractErrorMessage(err: unknown): string {
    const ax = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
    }>;

    // 1) The API told us what's wrong.
    if (ax.response?.data?.message) {
        return ax.response.data.message;
    }

    // 2) Validation errors come as a per-field map.
    if (ax.response?.data?.errors) {
        const first = Object.values(ax.response.data.errors).flat()[0];
        if (first) return first;
    }

    // 3) The request never reached the server (CORS, server down, ...).
    if (!ax.response) {
        return 'Cannot reach the API server. Make sure `php artisan serve` is running on http://localhost:8000.';
    }

    // 4) Fallback by status code.
    if (ax.response.status === 401 || ax.response.status === 422) {
        return 'The provided credentials are incorrect.';
    }
    if (ax.response.status >= 500) {
        const data: any = ax.response.data;
        if (typeof data?.message === 'string' && data.message) {
            return `Server error: ${data.message}`;
        }
        return 'The server encountered an error. Please try again later.';
    }
    return `Request failed (HTTP ${ax.response.status}).`;
}

export default function LoginPage() {
    const { login, isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();
    const location = useLocation() as { state?: { from?: { pathname?: string } } };
    const from = location.state?.from?.pathname ?? '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isInitializing && isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back!"
            subtitle="Sign in to continue your recovery management."
        >
            <div className="text-center mb-7">
                <div className="mx-auto h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <LockClosedIcon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Sign in to your account</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Enter your credentials to access your dashboard
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <AuthField
                    label="Email address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    leadingIcon={<EnvelopeIcon className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />}
                    invalid={Boolean(error)}
                />

                <PasswordField
                    label="Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    leadingIcon={<LockClosedIcon className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />}
                    invalid={Boolean(error)}
                />

                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5"
                    >
                        <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className={[
                        'w-full inline-flex items-center justify-center gap-2',
                        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
                        'text-white text-sm font-semibold py-2.5 rounded-xl',
                        'shadow-sm shadow-blue-600/30',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                        'transition focus:outline-none focus:ring-2 focus:ring-blue-500/40',
                    ].join(' ')}
                >
                    {submitting ? 'Signing in…' : 'Sign in'}
                    {!submitting && <ArrowRightCircleIcon className="h-5 w-5" />}
                </button>
            </form>

            <p className="text-sm text-slate-500 text-center mt-5">
                Don't have an account?{' '}
                <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition"
                >
                    Register
                </Link>
            </p>

            
        </AuthLayout>
    );
}
