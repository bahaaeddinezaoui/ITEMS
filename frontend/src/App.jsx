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
import StockItemInstanceCreatePage from './pages/StockItemInstanceCreatePage';
import ConsumablesPage from './pages/ConsumablesPage';
import ConsumablesTypesPage from './pages/ConsumablesTypesPage';
import ConsumablesTypeAttributesPage from './pages/ConsumablesTypeAttributesPage';
import ConsumablesModelsPage from './pages/ConsumablesModelsPage';
import ConsumableModelCompatibilityPage from './pages/ConsumableModelCompatibilityPage';
import ConsumablesAttributeDefinitionsPage from './pages/ConsumablesAttributeDefinitionsPage';
import ConsumableInstanceCreatePage from './pages/ConsumableInstanceCreatePage';
import LocationsPage from './pages/LocationsPage';
import PositionsPage from './pages/PositionsPage';
import OrganizationalStructurePage from './pages/OrganizationalStructurePage';
import MyItemsPage from './pages/MyItemsPage';
import OptionsPage from './pages/OptionsPage';
import ReportsPage from './pages/ReportsPage';
import AttributionOrdersPage from './pages/AttributionOrdersPage';
import AttributionOrderAssetIncludedItemsPage from './pages/AttributionOrderAssetIncludedItemsPage';
import AttributionOrderAssetAccessoriesPage from './pages/AttributionOrderAssetAccessoriesPage';
import AttributionOrderAssetAccessoriesDraftPage from './pages/AttributionOrderAssetAccessoriesDraftPage';
import AttributionOrderAssetsPage from './pages/AttributionOrderAssetsPage';
import CompanyAssetRequestsPage from './pages/CompanyAssetRequestsPage';
import AdministrativeCertificatesPage from './pages/AdministrativeCertificatesPage';
import AdministrativeCertificateMoveItemsPage from './pages/AdministrativeCertificateMoveItemsPage';
import DestructionCertificatesPage from './pages/DestructionCertificatesPage';
import AssetDestructionCertificatesPage from './pages/AssetDestructionCertificatesPage';
import ItemRequestsInboxPage from './pages/ItemRequestsInboxPage';
import MaintenanceStepsPage from './pages/MaintenanceStepsPage';
import ExternalMaintenancesPage from './pages/ExternalMaintenancesPage';
import AssetMaintenanceTimelinePage from './pages/AssetMaintenanceTimelinePage';
import IncludedItemMovementsApprovalPage from './pages/IncludedItemMovementsApprovalPage';
import AssetMovementsApprovalPage from './pages/AssetMovementsApprovalPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderCreatePage from './pages/PurchaseOrderCreatePage';
import PurchaseOrderDetailsPage from './pages/PurchaseOrderDetailsPage';
import PurchaseOrderReceivePage from './pages/PurchaseOrderReceivePage';
import PurchaseOrderBackorderReportsPage from './pages/PurchaseOrderBackorderReportsPage';
import DeliveryNoteConsultPage from './pages/DeliveryNoteConsultPage';
import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isSuperuser } = useAuth();

    if (isSuperuser) {
        return children;
    }

    const roleCodes = Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : [];
    const isAllowed = Array.isArray(allowedRoles) && allowedRoles.some((r) => roleCodes.includes(r));

    if (!isAllowed) {
        return <Navigate to="/dashboard" replace />;
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

                        <Route
                            path="persons"
                            element={
                                <RoleProtectedRoute allowedRoles={[]}>
                                    <PersonsPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="assets"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <Navigate to="/dashboard/assets/types" replace />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/types"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetsTypesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/types/attributes"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetsTypeAttributesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/models"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetsModelsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/models/default-composition"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetModelDefaultCompositionSelectPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/models/:modelId/default-composition"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetModelDefaultCompositionSelectPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/models/:modelId/compatibility"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetModelCompatibilityPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/instances"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="assets/attribute-definitions"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetsAttributeDefinitionsPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="maintenances"
                            element={
                                <RoleProtectedRoute allowedRoles={['maintenance_chief', 'maintenance_technician', 'it_bureau_chief']}>
                                    <MaintenancesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="maintenances/:maintenanceId/steps"
                            element={
                                <RoleProtectedRoute allowedRoles={['maintenance_chief', 'maintenance_technician', 'it_bureau_chief']}>
                                    <MaintenanceStepsPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="stock-items"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <Navigate to="/dashboard/stock-items/types" replace />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="stock-items/types"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <StockItemsTypesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="stock-items/types/attributes"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <StockItemsTypeAttributesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="stock-items/models"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <StockItemsModelsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="stock-items/models/:modelId/compatibility"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <StockItemModelCompatibilityPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="stock-items/instances"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <StockItemsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="stock-items/instances/create"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <StockItemInstanceCreatePage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="stock-items/attribute-definitions"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <StockItemsAttributeDefinitionsPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="consumables"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <Navigate to="/dashboard/consumables/types" replace />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="consumables/types"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ConsumablesTypesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="consumables/types/attributes"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ConsumablesTypeAttributesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="consumables/models"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ConsumablesModelsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="consumables/models/:modelId/compatibility"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ConsumableModelCompatibilityPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="consumables/instances"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ConsumablesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="consumables/instances/create"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ConsumableInstanceCreatePage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="consumables/attribute-definitions"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ConsumablesAttributeDefinitionsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route path="my-items" element={<MyItemsPage />} />
                        <Route path="my-items/assets/:assetId/maintenance-timeline" element={<AssetMaintenanceTimelinePage />} />
                        <Route path="options" element={<OptionsPage />} />

                        <Route
                            path="reports"
                            element={
                                <RoleProtectedRoute allowedRoles={['maintenance_chief', 'exploitation_chief', 'it_bureau_chief']}>
                                    <ReportsPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="locations"
                            element={
                                <RoleProtectedRoute allowedRoles={[]}>
                                    <LocationsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="positions"
                            element={
                                <RoleProtectedRoute allowedRoles={[]}>
                                    <PositionsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="organizational-structure"
                            element={
                                <RoleProtectedRoute allowedRoles={[]}>
                                    <OrganizationalStructurePage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="attribution-orders"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AttributionOrdersPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="attribution-orders/assets/:rowId/included-items"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AttributionOrderAssetIncludedItemsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="attribution-orders/assets/:rowId/included-items/:itemKind"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AttributionOrderAssetIncludedItemsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="attribution-orders/assets/:rowId/accessories"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AttributionOrderAssetAccessoriesDraftPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="attribution-orders/:orderId/assets/:assetId/accessories"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AttributionOrderAssetAccessoriesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="attribution-orders/:orderId/assets"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AttributionOrderAssetsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="company-asset-requests"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <CompanyAssetRequestsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="administrative-certificates"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AdministrativeCertificatesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="administrative-certificates/:certificateId/move-items"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AdministrativeCertificateMoveItemsPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="external-maintenances"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <ExternalMaintenancesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="asset-movements-approval"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'it_bureau_chief']}>
                                    <AssetMovementsApprovalPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="destruction-certificates"
                            element={
                                <RoleProtectedRoute allowedRoles={['exploitation_chief', 'it_bureau_chief']}>
                                    <Navigate to="/dashboard/stock-consumable-destruction-certificates" replace />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="stock-consumable-destruction-certificates"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <DestructionCertificatesPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="asset-destruction-certificates"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible', 'exploitation_chief', 'it_bureau_chief']}>
                                    <AssetDestructionCertificatesPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="item-requests-inbox"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible']}>
                                    <ItemRequestsInboxPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="included-item-movements-approval"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible']}>
                                    <IncludedItemMovementsApprovalPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="purchase-orders"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'director_admin_support', 'protection_and_security_bureau_chief', 'school_headquarter']}>
                                    <PurchaseOrdersPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="purchase-orders/:orderId"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible', 'director_admin_support', 'protection_and_security_bureau_chief', 'school_headquarter']}>
                                    <PurchaseOrderDetailsPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="purchase-orders/:orderId/receive"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible']}>
                                    <PurchaseOrderReceivePage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="purchase-orders/:orderId/backorder-reports"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible']}>
                                    <PurchaseOrderBackorderReportsPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="purchase-orders/:orderId/delivery-note"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible']}>
                                    <DeliveryNoteConsultPage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="purchase-orders/create"
                            element={
                                <RoleProtectedRoute allowedRoles={['stock_consumable_responsible']}>
                                    <PurchaseOrderCreatePage />
                                </RoleProtectedRoute>
                            }
                        />

                        <Route
                            path="asset-movements-approval"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible']}>
                                    <AssetMovementsApprovalPage />
                                </RoleProtectedRoute>
                            }
                        />
                        <Route
                            path="external-maintenances"
                            element={
                                <RoleProtectedRoute allowedRoles={['asset_responsible']}>
                                    <ExternalMaintenancesPage />
                                </RoleProtectedRoute>
                            }
                        />
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
