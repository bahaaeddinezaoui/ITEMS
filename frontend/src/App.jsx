import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import PersonsPage from './pages/PersonsPage';
import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isSuperuser } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isSuperuser) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isSuperuser } = useAuth();

    if (isAuthenticated && isSuperuser) {
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
