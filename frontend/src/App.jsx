import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import PersonsPage from './pages/PersonsPage';
import AssetsPage from './pages/AssetsPage';
import MaintenancesPage from './pages/MaintenancesPage';
import StockItemsPage from './pages/StockItemsPage';
import ConsumablesPage from './pages/ConsumablesPage';
import RoomsPage from './pages/RoomsPage';
import PositionsPage from './pages/PositionsPage';
import OrganizationalStructurePage from './pages/OrganizationalStructurePage';
import MyItemsPage from './pages/MyItemsPage';
import ReportsPage from './pages/ReportsPage';
import AttributionOrdersPage from './pages/AttributionOrdersPage';
import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardHome />} />
                        <Route path="persons" element={<PersonsPage />} />
                        <Route path="assets" element={<AssetsPage />} />
                        <Route path="maintenances" element={<MaintenancesPage />} />
                        <Route path="stock-items" element={<StockItemsPage />} />
                        <Route path="consumables" element={<ConsumablesPage />} />
                        <Route path="my-items" element={<MyItemsPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="rooms" element={<RoomsPage />} />
                        <Route path="positions" element={<PositionsPage />} />
                        <Route path="organizational-structure" element={<OrganizationalStructurePage />} />
                        <Route path="attribution-orders" element={<AttributionOrdersPage />} />
                    </Route>

                    {/* Redirect root to login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
