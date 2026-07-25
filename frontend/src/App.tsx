import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import DossierDetailPage from './pages/DossierDetailPage';
import DossierListPage from './pages/DossierListPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import InvoiceListPage from './pages/InvoiceListPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotificationListPage from './pages/NotificationListPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import VehicleListPage from './pages/VehicleListPage';

function HomeRedirect() {
    const { isAuthenticated, isInitializing } = useAuth();
    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading...
            </div>
        );
    }
    // Always default to the Dashboard. Auth-guarded routes will bounce to /login if needed.
    return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes - wrapped in the Layout (sidebar + navbar) */}
            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                {/* Dashboard is the default landing page after login */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dossiers" element={<DossierListPage />} />
                <Route path="/dossiers/:id" element={<DossierDetailPage />} />
                <Route path="/vehicles" element={<VehicleListPage />} />
                <Route path="/invoices" element={<InvoiceListPage />} />
                <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="/notifications" element={<NotificationListPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Default routes - always land on the Dashboard (auth check inside) */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
        </Routes>
    );
}
