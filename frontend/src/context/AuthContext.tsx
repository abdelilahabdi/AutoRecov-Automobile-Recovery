import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    authApi,
    AUTH_UNAUTHORIZED_EVENT,
    getToken,
    setToken,
    AuthCredentials,
    RegisterPayload,
} from '../services/api';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface User {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'agent';
}

export interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (credentials: AuthCredentials) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(getToken());
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    /* ------------------------------------------------------------------ */
    /*  Bootstrap: if a token exists in localStorage, fetch the user       */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        const bootstrap = async () => {
            if (!token) {
                setIsInitializing(false);
                return;
            }
            try {
                const me = await authApi.me();
                setUser(me);
            } catch {
                setToken(null);
                setTokenState(null);
                setUser(null);
            } finally {
                setIsInitializing(false);
            }
        };

        void bootstrap();
    }, [token]);

    /* ------------------------------------------------------------------ */
    /*  Global 401 listener — fired by the Axios interceptor in api.ts.   */
    /*  We clear local state immediately so the UI reflects the logged-out*/
    /*  state without waiting for the full-page redirect.                  */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleUnauthorized = () => {
            setUser(null);
            setTokenState(null);
            setToken(null);
        };

        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => {
            window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
        };
    }, []);

    /* ------------------------------------------------------------------ */
    /*  Actions                                                            */
    /* ------------------------------------------------------------------ */
    const login = useCallback(async (credentials: AuthCredentials) => {
        const response = await authApi.login(credentials);
        setToken(response.data.token);
        setTokenState(response.data.token);
        setUser(response.data.user);
    }, []);

    const register = useCallback(async (payload: RegisterPayload) => {
        const response = await authApi.register(payload);
        setToken(response.data.token);
        setTokenState(response.data.token);
        setUser(response.data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            /* ignore */
        } finally {
            setToken(null);
            setTokenState(null);
            setUser(null);
        }
    }, []);

    /* ------------------------------------------------------------------ */
    /*  Memoized value                                                     */
    /* ------------------------------------------------------------------ */
    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            isAuthenticated: !!token && !!user,
            isInitializing,
            login,
            register,
            logout,
        }),
        [user, token, isInitializing, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                        */
/* -------------------------------------------------------------------------- */

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error('useAuth must be used within an <AuthProvider>.');
    }
    return ctx;
}
