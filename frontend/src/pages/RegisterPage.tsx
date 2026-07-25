import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-6">
                    <div className="text-4xl">🚗</div>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Create an account</h1>
                    <p className="text-sm text-gray-500">Start managing recovery cases</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            minLength={8}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {submitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-slate-800 font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
