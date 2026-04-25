import { useEffect, useRef, useState, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import PageTransition from './PageTransition';
import Iridescence from './Iridescence';

const NavSection = ({ title, isSidebarCollapsed, isCollapsed, onToggle, children }) => (
    <div className={`nav-section${isCollapsed ? ' nav-section--collapsed' : ''}`}>
        {!isSidebarCollapsed && title && (
            <button className="nav-section-title" onClick={onToggle} aria-expanded={!isCollapsed}>
                {title}
                <svg className="nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
        )}
        <div className="nav-section-links">
            <div>
                {children}
            </div>
        </div>
    </div>
);

const DashboardLayout = () => {
    const { user, logout, isSuperuser } = useAuth();
    const { isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState(new Set(['dashboard', 'orgStructure', 'my', 'reports', 'inventory', 'maintenance']));
    const userMenuRef = useRef(null);

    const toggleSection = (key) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = () => {
        if (user?.person) {
            return `${user.person.first_name[0]}${user.person.last_name[0]}`.toUpperCase();
        }
        return user?.username?.[0]?.toUpperCase() || 'U';
    };

    const getFullName = () => {
        if (user?.person) {
            return `${user.person.first_name} ${user.person.last_name}`;
        }
        return user?.username || t('common.user');
    };

    const getRoleLabel = () => {
        if (isSuperuser) return t('common.superuser');
        if (user?.roles && user.roles.length > 0) {
            return user.roles[0].role_label;
        }
        return t('common.user');
    };

    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some(r =>
            r.role_code === 'maintenance_chief' ||
            r.role_code === 'exploitation_chief' ||
            r.role_code === 'it_bureau_chief' ||
            r.role_code === 'network_maintenance_technician'
        ) || false;
    }, [isSuperuser, user]);

    const isMaintenanceChief = user?.roles?.some(role => role.role_code === 'maintenance_chief');
    const isMaintenanceTechnician = user?.roles?.some(role => role.role_code === 'it_maintenance_technician');
    const isNetworkMaintenanceTechnician = user?.roles?.some(role => role.role_code === 'network_maintenance_technician');
    const isExploitationChief = user?.roles?.some(role => role.role_code === 'exploitation_chief');
    const isStockConsumableResponsible = isSuperuser || user?.roles?.some(role => role.role_code === 'stock_consumable_responsible');
    const isAssetResponsible = user?.roles?.some(role => role.role_code === 'asset_responsible');
    const isItBureauChief = user?.roles?.some(role => role.role_code === 'it_bureau_chief');
    const isDirectorAdminSupport = user?.roles?.some(role => role.role_code === 'director_admin_support');
    const isProtectionSecurityBureauChief = user?.roles?.some(role => role.role_code === 'protection_and_security_bureau_chief');
    const isSchoolHeadquarter = user?.roles?.some(role => role.role_code === 'school_headquarter');
    const canViewPurchaseOrders = isSuperuser || isStockConsumableResponsible || isExploitationChief || isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter || isItBureauChief;
    const canViewProblemReports = isSuperuser || isMaintenanceChief || isItBureauChief;
    const canViewIncidentReports = isSuperuser || isItBureauChief || isProtectionSecurityBureauChief || isSchoolHeadquarter || !!user?.person?.person_id;

    useEffect(() => {
        if (!isUserMenuOpen) return;

        const handleOutsideClick = (event) => {
            if (!userMenuRef.current) return;
            if (!userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isUserMenuOpen]);

    return (
        <div className="dashboard-layout">
            <div className="dashboard-iridescence-bg" aria-hidden="true">
                <Iridescence
                    color={isDark ? [0.05, 0, 0.08] : [1, 1, 1]}
                    mouseReact={false}
                    amplitude={0.1}
                    speed={1.0}
                />
            </div>
            {/* Sidebar */}
            <aside className={`sidebar${isSidebarCollapsed ? ' sidebar--collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        {!isSidebarCollapsed && <span className="sidebar-logo-text">EMS</span>}
                    </div>
                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setIsSidebarCollapsed(v => !v)}
                        title={isSidebarCollapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
                        aria-label={isSidebarCollapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isSidebarCollapsed
                                ? <polyline points="9 18 15 12 9 6" />
                                : <polyline points="15 18 9 12 15 6" />
                            }
                        </svg>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <NavSection title={t('nav.dashboard')} isSidebarCollapsed={isSidebarCollapsed} isCollapsed={!isSidebarCollapsed && collapsedSections.has('dashboard')} onToggle={() => toggleSection('dashboard')}>
                        <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.dashboard') : undefined}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            {!isSidebarCollapsed && t('nav.dashboard')}
                        </NavLink>
                    </NavSection>

                    {isSuperuser && (
                        <NavSection title={t('nav.organizationalStructure')} isSidebarCollapsed={isSidebarCollapsed} isCollapsed={!isSidebarCollapsed && collapsedSections.has('orgStructure')} onToggle={() => toggleSection('orgStructure')}>

                                <NavLink to="/dashboard/organizational-structure" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.organizationalStructure') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                        <path d="M3.27 6.96a3 3 0 0 1 5.46 0" />
                                        <path d="M15.27 6.96a3 3 0 0 1 5.46 0" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.organizationalStructure')}
                                </NavLink>

                                <NavLink to="/dashboard/persons" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.persons') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.persons')}
                                </NavLink>

                                <NavLink to="/dashboard/user-approval" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.userApproval') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <polyline points="16 11 18 13 22 9" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.userApproval')}
                                </NavLink>

                                <NavLink to="/dashboard/locations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.locations') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M9 3v18M9 9h12M9 15h12" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.locations')}
                                </NavLink>

                                <NavLink to="/dashboard/positions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.positions') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.positions')}
                                </NavLink>

                                <NavLink to="/dashboard/position-role-mappings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.positionRoleLinks') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M8 7h8" />
                                        <path d="M8 12h8" />
                                        <path d="M8 17h8" />
                                        <circle cx="4" cy="7" r="1.5" />
                                        <circle cx="20" cy="12" r="1.5" />
                                        <circle cx="4" cy="17" r="1.5" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.positionRoleLinks')}
                                </NavLink>
                        </NavSection>
                    )}

                    <NavSection title={t('navSections.my')} isSidebarCollapsed={isSidebarCollapsed} isCollapsed={!isSidebarCollapsed && collapsedSections.has('my')} onToggle={() => toggleSection('my')}>
                        <NavLink to="/dashboard/my-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.myItems') : undefined}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {!isSidebarCollapsed && t('nav.myItems')}
                        </NavLink>
                        <NavLink to="/dashboard/my-reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.myReports') : undefined}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3h18v18H3z" />
                                <path d="M7 7h10" />
                                <path d="M7 12h10" />
                                <path d="M7 17h6" />
                            </svg>
                            {!isSidebarCollapsed && t('nav.myReports')}
                        </NavLink>
                    </NavSection>

                    {(canViewProblemReports || canViewIncidentReports) && (
                        <NavSection title={t('navSections.reports')} isSidebarCollapsed={isSidebarCollapsed} isCollapsed={!isSidebarCollapsed && collapsedSections.has('reports')} onToggle={() => toggleSection('reports')}>
                            {canViewProblemReports && (
                                <NavLink to="/dashboard/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.reports') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 3h18v18H3z" />
                                        <path d="M7 7h10" />
                                        <path d="M7 12h10" />
                                        <path d="M7 17h6" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.reports')}
                                </NavLink>
                            )}
                            {canViewIncidentReports && (
                                <NavLink to="/dashboard/incident-reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('assetIncidentReports.title') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 3h18v18H3z" />
                                        <path d="M7 7h10" />
                                        <path d="M7 12h10" />
                                        <path d="M7 17h6" />
                                    </svg>
                                    {!isSidebarCollapsed && t('assetIncidentReports.title')}
                                </NavLink>
                            )}
                        </NavSection>
                    )}

                    {(isSuperuser || isExploitationChief || isItBureauChief || isStockConsumableResponsible || isAssetResponsible || isDirectorAdminSupport || isProtectionSecurityBureauChief || isSchoolHeadquarter || isMaintenanceChief || isMaintenanceTechnician || isNetworkMaintenanceTechnician) && (
                        <NavSection title={t('navSections.inventory')} isSidebarCollapsed={isSidebarCollapsed} isCollapsed={!isSidebarCollapsed && collapsedSections.has('inventory')} onToggle={() => toggleSection('inventory')}>

                            {(isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief || isMaintenanceChief || isMaintenanceTechnician || isNetworkMaintenanceTechnician) && (
                                <NavLink to="/dashboard/location-inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.locationInventory') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
                                        <circle cx="12" cy="9" r="2.5" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.locationInventory')}
                                </NavLink>
                            )}

                            {(isSuperuser || isExploitationChief || isItBureauChief || isAssetResponsible) && (
                                <NavLink to="/dashboard/assets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.assets') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.assets')}
                                </NavLink>
                            )}

                            {canViewPurchaseOrders && (
                                <NavLink to="/dashboard/purchase-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.purchaseOrders') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12h6" />
                                        <path d="M9 16h6" />
                                        <path d="M9 8h6" />
                                        <path d="M7 22h10a2 2 0 0 0 2-2V6l-4-4H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
                                        <path d="M15 2v4h4" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.purchaseOrders')}
                                </NavLink>
                            )}

                            {(isSuperuser || isExploitationChief || isItBureauChief || isStockConsumableResponsible) && (
                                <>
                                    <NavLink to="/dashboard/stock-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.stockItems') : undefined}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        {!isSidebarCollapsed && t('nav.stockItems')}
                                    </NavLink>

                                    <NavLink to="/dashboard/consumables" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.consumables') : undefined}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                        {!isSidebarCollapsed && t('nav.consumables')}
                                    </NavLink>
                                </>
                            )}

                            {(isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief) && (
                                <NavLink to="/dashboard/attribution-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.attributionOrders') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.attributionOrders')}
                                </NavLink>
                            )}

                            {(isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief) && (
                                <NavLink to="/dashboard/company-asset-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.companyAssetRequests') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12h6" />
                                        <path d="M9 16h6" />
                                        <path d="M9 8h6" />
                                        <path d="M7 22h10a2 2 0 0 0 2-2V6l-4-4H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
                                        <path d="M15 2v4h4" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.companyAssetRequests')}
                                </NavLink>
                            )}

                            {(isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief) && (
                                <NavLink to="/dashboard/administrative-certificates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.administrativeCertificates') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <path d="M8 13h8" />
                                        <path d="M8 17h8" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.administrativeCertificates')}
                                </NavLink>
                            )}

                            {(isSuperuser || isExploitationChief || isItBureauChief || isStockConsumableResponsible) && (
                                <NavLink to="/dashboard/stock-consumable-destruction-certificates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.stockConsumableDestructionCertificates') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4h8v2" />
                                        <path d="M6 6l1 16h10l1-16" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.stockConsumableDestructionCertificates')}
                                </NavLink>
                            )}

                            {(isSuperuser || isExploitationChief || isItBureauChief || isAssetResponsible) && (
                                <NavLink to="/dashboard/asset-destruction-certificates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('assetDestructionCertificates.title') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4h8v2" />
                                        <path d="M6 6l1 16h10l1-16" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                    {!isSidebarCollapsed && t('assetDestructionCertificates.title')}
                                </NavLink>
                            )}

                            {(isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief) && (
                                <NavLink to="/dashboard/external-maintenances" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.externalMaintenances') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.externalMaintenances')}
                                </NavLink>
                            )}

                            {(isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief) && (
                                <NavLink to="/dashboard/asset-movements-approval" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.assetMovementsApprovals') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12h6" />
                                        <path d="M9 16h6" />
                                        <path d="M9 8h6" />
                                        <path d="M7 22h10a2 2 0 0 0 2-2V6l-4-4H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
                                        <path d="M15 2v4h4" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.assetMovementsApprovals')}
                                </NavLink>
                            )}

                            

                            {(isSuperuser || isStockConsumableResponsible || isExploitationChief) && (
                                <>
                                    <NavLink to="/dashboard/stock-consumables-inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.stockConsumablesInventory') : undefined}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="14" y="14" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                        </svg>
                                        {!isSidebarCollapsed && t('nav.stockConsumablesInventory')}
                                    </NavLink>

                                    <NavLink to="/dashboard/item-requests-inbox" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.itemRequestsInbox') : undefined}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 12h6" />
                                            <path d="M9 16h6" />
                                            <path d="M9 8h6" />
                                            <path d="M7 22h10a2 2 0 0 0 2-2V6l-4-4H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
                                            <path d="M15 2v4h4" />
                                        </svg>
                                        {!isSidebarCollapsed && t('nav.itemRequestsInbox')}
                                    </NavLink>

                                    <NavLink to="/dashboard/included-item-movements-approval" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.includedItemsApprovals') : undefined}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 12h6" />
                                            <path d="M9 16h6" />
                                            <path d="M9 8h6" />
                                            <path d="M7 22h10a2 2 0 0 0 2-2V6l-4-4H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
                                            <path d="M15 2v4h4" />
                                        </svg>
                                        {!isSidebarCollapsed && t('nav.includedItemsApprovals')}
                                    </NavLink>
                                </>
                            )}
                        </NavSection>
                    )}

                    {(isSuperuser || user?.roles?.some(r =>
                        ['maintenance_chief', 'it_maintenance_technician', 'it_bureau_chief', 'network_maintenance_technician'].includes(r.role_code)
                    )) && (
                        <NavSection title={t('navSections.maintenance')} isSidebarCollapsed={isSidebarCollapsed} isCollapsed={!isSidebarCollapsed && collapsedSections.has('maintenance')} onToggle={() => toggleSection('maintenance')}>
                            <NavLink to="/dashboard/maintenances" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.maintenances') : undefined}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                                {!isSidebarCollapsed && t('nav.maintenances')}
                            </NavLink>
                            {(isMaintenanceTechnician || isNetworkMaintenanceTechnician) && (
                                <NavLink to="/dashboard/my-maintenance-stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.myMaintenanceStats') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.myMaintenanceStats')}
                                </NavLink>
                            )}
                            {(isSuperuser || isMaintenanceChief) && (
                                <NavLink to="/dashboard/asset-maintenance-history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('assetMaintenanceHistory.title') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="16" rx="2" />
                                        <path d="M8 2v4M16 2v4" />
                                        <path d="M3 10h18" />
                                        <path d="M8 14h8" />
                                        <path d="M8 18h6" />
                                    </svg>
                                    {!isSidebarCollapsed && t('assetMaintenanceHistory.title')}
                                </NavLink>
                            )}
                            {(isMaintenanceChief || isItBureauChief || isSuperuser) && (
                                <NavLink to="/dashboard/maintenance-stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title={isSidebarCollapsed ? t('nav.maintenanceStats') : undefined}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 20V10" />
                                        <path d="M12 20V4" />
                                        <path d="M6 20v-6" />
                                    </svg>
                                    {!isSidebarCollapsed && t('nav.maintenanceStats')}
                                </NavLink>
                            )}
                        </NavSection>
                    )}
                </nav>

                <div className="sidebar-footer" style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                }}>
                    {!isSidebarCollapsed && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ThemeToggle />
                        </div>
                    )}
                    <div
                        className="user-info"
                        ref={userMenuRef}
                        role="button"
                        tabIndex={0}
                        aria-haspopup="menu"
                        aria-expanded={isUserMenuOpen}
                        onClick={() => setIsUserMenuOpen((v) => !v)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsUserMenuOpen((v) => !v);
                            }
                        }}
                    >
                        <div className="user-avatar">{getInitials()}</div>
                        {!isSidebarCollapsed && (
                            <div className="user-details">
                                <div className="user-name">{getFullName()}</div>
                                <div className="user-role">{getRoleLabel()}</div>
                            </div>
                        )}
                        {!isSidebarCollapsed && isUserMenuOpen && (
                            <div
                                className="user-menu"
                                role="menu"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="user-menu-item"
                                    role="menuitem"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUserMenuOpen(false);
                                        navigate('/dashboard/options');
                                    }}
                                >
                                    {t('nav.options')}
                                </button>
                                <button
                                    type="button"
                                    className="user-menu-item"
                                    role="menuitem"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    {t('common.profile')}
                                </button>
                                <button
                                    type="button"
                                    className="user-menu-item"
                                    role="menuitem"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUserMenuOpen(false);
                                        navigate('/dashboard/options');
                                    }}
                                >
                                    {t('common.security')}
                                </button>
                                <div className="user-menu-item language-switcher-item">
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        )}
                        <button
                            className="logout-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLogout();
                            }}
                            title={t('nav.logout')}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16,17 21,12 16,7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
        </div>
    );
};

export default DashboardLayout;
