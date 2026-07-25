import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
    ArrowRightCircleIcon,
    EnvelopeIcon,
    ExclamationCircleIcon,
    LockClosedIcon,
    UserPlusIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { AuthField, PasswordField } from '../components/AuthField';

/**
 * Same logic as the login page: surface the real error from the API
 * (or from the network layer) instead of a generic placeholder.
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

    // 4) For 500s, try to surface the exception class so the user can
    //    report it usefully (Laravel returns `exception: "Symfony\\Component\\..."`).
    if (ax.response.status >= 500) {
        const data: any = ax.response.data;
        if (typeof data?.message === 'string' && data.message) {
            return `Server error: ${data.message}`;
        }
        return 'The server encountered an error. Please try again later.';
    }
    return `Request failed (HTTP ${ax.response.status}).`;
}

export default function RegisterPage() {
    const { register, isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await register({ name, email, password, password_confirmation: passwordConfirmation });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Create account"
            subtitle="Join us and start managing your recovery cases."
        >
            <div className="text-center mb-7">
                <div className="mx-auto h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <UserPlusIcon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Create your account</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Fill in the details to get started
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <AuthField
                    label="Full name"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    leadingIcon={<UserIcon className="h-[1.125rem] w-[1.125rem]" />}
                    invalid={Boolean(error)}
                />

                <AuthField
                    label="Email address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    leadingIcon={<EnvelopeIcon className="h-[1.125rem] w-[1.125rem]" />}
                    invalid={Boolean(error)}
                />

                <PasswordField
                    label="Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    leadingIcon={<LockClosedIcon className="h-[1.125rem] w-[1.125rem]" />}
                    invalid={Boolean(error)}
                />

                <PasswordField
                    label="Confirm password"
                    name="password_confirmation"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    leadingIcon={<LockClosedIcon className="h-[1.125rem] w-[1.125rem]" />}
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
                    {submitting ? 'Creating account…' : 'Create account'}
                    {!submitting && <ArrowRightCircleIcon className="h-5 w-5" />}
                </button>
            </form>

            <p className="text-sm text-slate-500 text-center mt-5">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}
