import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import PersonsPage from './pages/PersonsPage';
import AssetsPage from './pages/AssetsPage';
import AssetsTypesPage from './pages/AssetsTypesPage';
import AssetsTypeAttributesPage from './pages/AssetsTypeAttributesPage';
import AssetsModelsPage from './pages/AssetsModelsPage';
import AssetsAttributeDefinitionsPage from './pages/AssetsAttributeDefinitionsPage';
import AssetModelCompatibilityPage from './pages/AssetModelCompatibilityPage';
import AssetModelDefaultCompositionSelectPage from './pages/AssetModelDefaultCompositionSelectPage';
import MaintenancesPage from './pages/MaintenancesPage';
import StockItemsPage from './pages/StockItemsPage';
import StockItemsTypesPage from './pages/StockItemsTypesPage';
import StockItemsTypeAttributesPage from './pages/StockItemsTypeAttributesPage';
import StockItemsModelsPage from './pages/StockItemsModelsPage';
import StockItemModelCompatibilityPage from './pages/StockItemModelCompatibilityPage';
import StockItemsAttributeDefinitionsPage from './pages/StockItemsAttributeDefinitionsPage';
import ConsumablesPage from './pages/ConsumablesPage';
import ConsumablesTypesPage from './pages/ConsumablesTypesPage';
import ConsumablesTypeAttributesPage from './pages/ConsumablesTypeAttributesPage';
import ConsumablesModelsPage from './pages/ConsumablesModelsPage';
import ConsumableModelCompatibilityPage from './pages/ConsumableModelCompatibilityPage';
import ConsumablesAttributeDefinitionsPage from './pages/ConsumablesAttributeDefinitionsPage';
import RoomsPage from './pages/RoomsPage';
import PositionsPage from './pages/PositionsPage';
import OrganizationalStructurePage from './pages/OrganizationalStructurePage';
import MyItemsPage from './pages/MyItemsPage';
import ReportsPage from './pages/ReportsPage';
import AttributionOrdersPage from './pages/AttributionOrdersPage';
import AttributionOrderAssetIncludedItemsPage from './pages/AttributionOrderAssetIncludedItemsPage';
import CompanyAssetRequestsPage from './pages/CompanyAssetRequestsPage';
import AdministrativeCertificatesPage from './pages/AdministrativeCertificatesPage';
import ItemRequestsInboxPage from './pages/ItemRequestsInboxPage';
import MaintenanceStepsPage from './pages/MaintenanceStepsPage';
import ExternalMaintenancesPage from './pages/ExternalMaintenancesPage';
import AssetMaintenanceTimelinePage from './pages/AssetMaintenanceTimelinePage';
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
                        <Route path="assets" element={<Navigate to="/dashboard/assets/types" replace />} />
                        <Route path="assets/types" element={<AssetsTypesPage />} />
                        <Route path="assets/types/attributes" element={<AssetsTypeAttributesPage />} />
                        <Route path="assets/models" element={<AssetsModelsPage />} />
                        <Route path="assets/models/default-composition" element={<AssetModelDefaultCompositionSelectPage />} />
                        <Route path="assets/models/:modelId/default-composition" element={<AssetModelDefaultCompositionSelectPage />} />
                        <Route path="assets/models/:modelId/compatibility" element={<AssetModelCompatibilityPage />} />
                        <Route path="assets/instances" element={<AssetsPage />} />
                        <Route path="assets/attribute-definitions" element={<AssetsAttributeDefinitionsPage />} />
                        <Route path="maintenances" element={<MaintenancesPage />} />
                        <Route path="maintenances/:maintenanceId/steps" element={<MaintenanceStepsPage />} />
                        <Route path="stock-items" element={<Navigate to="/dashboard/stock-items/types" replace />} />
                        <Route path="stock-items/types" element={<StockItemsTypesPage />} />
                        <Route path="stock-items/types/attributes" element={<StockItemsTypeAttributesPage />} />
                        <Route path="stock-items/models" element={<StockItemsModelsPage />} />
                        <Route path="stock-items/models/:modelId/compatibility" element={<StockItemModelCompatibilityPage />} />
                        <Route path="stock-items/instances" element={<StockItemsPage />} />
                        <Route path="stock-items/attribute-definitions" element={<StockItemsAttributeDefinitionsPage />} />
                        <Route path="consumables" element={<Navigate to="/dashboard/consumables/types" replace />} />
                        <Route path="consumables/types" element={<ConsumablesTypesPage />} />
                        <Route path="consumables/types/attributes" element={<ConsumablesTypeAttributesPage />} />
                        <Route path="consumables/models" element={<ConsumablesModelsPage />} />
                        <Route path="consumables/models/:modelId/compatibility" element={<ConsumableModelCompatibilityPage />} />
                        <Route path="consumables/instances" element={<ConsumablesPage />} />
                        <Route path="consumables/attribute-definitions" element={<ConsumablesAttributeDefinitionsPage />} />
                        <Route path="my-items" element={<MyItemsPage />} />
                        <Route path="my-items/assets/:assetId/maintenance-timeline" element={<AssetMaintenanceTimelinePage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="rooms" element={<RoomsPage />} />
                        <Route path="positions" element={<PositionsPage />} />
                        <Route path="organizational-structure" element={<OrganizationalStructurePage />} />
                        <Route path="attribution-orders" element={<AttributionOrdersPage />} />
                        <Route path="attribution-orders/assets/:rowId/included-items" element={<AttributionOrderAssetIncludedItemsPage />} />
                        <Route path="attribution-orders/assets/:rowId/included-items/:itemKind" element={<AttributionOrderAssetIncludedItemsPage />} />
                        <Route path="company-asset-requests" element={<CompanyAssetRequestsPage />} />
                        <Route path="administrative-certificates" element={<AdministrativeCertificatesPage />} />
                        <Route path="item-requests-inbox" element={<ItemRequestsInboxPage />} />
                        <Route path="external-maintenances" element={<ExternalMaintenancesPage />} />
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
