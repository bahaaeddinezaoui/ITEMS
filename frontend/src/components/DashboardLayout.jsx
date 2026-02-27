import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user, logout, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

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
        return user?.username || 'User';
    };

    const getRoleLabel = () => {
        if (isSuperuser) return 'Superuser';
        if (user?.roles && user.roles.length > 0) {
            return user.roles[0].role_label;
        }
        return 'User';
    };

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

    const isMaintenanceChief = user?.roles?.some(role => role.role_code === 'maintenance_chief');
    const isMaintenanceTechnician = user?.roles?.some(role => role.role_code === 'maintenance_technician');
    const isExploitationChief = user?.roles?.some(role => role.role_code === 'exploitation_chief');
    const isStockConsumableResponsible = user?.roles?.some(role => role.role_code === 'stock_consumable_responsible');
    const isAssetResponsible = user?.roles?.some(role => role.role_code === 'asset_responsible');
    const canViewReports = isSuperuser || isMaintenanceChief || isExploitationChief;

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="sidebar-logo-text">EMS</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-title">Dashboard</span>
                        <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            Dashboard
                        </NavLink>
                    </div>

                    {isSuperuser && (
                        <>
                            <div className="nav-section">
                                <span className="nav-section-title">Management</span>

                                <NavLink to="/dashboard/organizational-structure" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                        <path d="M3.27 6.96a3 3 0 0 1 5.46 0" />
                                        <path d="M15.27 6.96a3 3 0 0 1 5.46 0" />
                                    </svg>
                                    Organizational Structure
                                </NavLink>

                                <NavLink to="/dashboard/persons" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Persons
                                </NavLink>

                                <NavLink to="/dashboard/assets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                    Assets
                                </NavLink>

                                <NavLink to="/dashboard/stock-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    Stock Items
                                </NavLink>

                                <NavLink to="/dashboard/consumables" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    Consumables
                                </NavLink>

                                <NavLink to="/dashboard/rooms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M9 3v18M9 9h12M9 15h12" />
                                    </svg>
                                    Rooms
                                </NavLink>

                                <NavLink to="/dashboard/positions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Positions
                                </NavLink>
                            </div>
                        </>
                    )}

                    <div className="nav-section">
                        <span className="nav-section-title">My</span>
                        <NavLink to="/dashboard/my-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            My Items
                        </NavLink>
                    </div>

                    {canViewReports && (
                        <div className="nav-section">
                            <span className="nav-section-title">Reports</span>
                            <NavLink to="/dashboard/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3h18v18H3z" />
                                    <path d="M7 7h10" />
                                    <path d="M7 12h10" />
                                    <path d="M7 17h6" />
                                </svg>
                                Reports
                            </NavLink>
                        </div>
                    )}

                    {(isExploitationChief || isStockConsumableResponsible || isAssetResponsible) && (
                        <div className="nav-section">
                            <span className="nav-section-title">Inventory</span>

                            {(isExploitationChief || isAssetResponsible) && (
                                <NavLink to="/dashboard/assets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                    Assets
                                </NavLink>
                            )}

                            {isAssetResponsible && (
                                <NavLink to="/dashboard/attribution-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                    Attribution Orders
                                </NavLink>
                            )}

                            {isAssetResponsible && (
                                <NavLink to="/dashboard/company-asset-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12h6" />
                                        <path d="M9 16h6" />
                                        <path d="M9 8h6" />
                                        <path d="M7 22h10a2 2 0 0 0 2-2V6l-4-4H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
                                        <path d="M15 2v4h4" />
                                    </svg>
                                    Company Asset Requests
                                </NavLink>
                            )}

                            {isAssetResponsible && (
                                <NavLink to="/dashboard/administrative-certificates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <path d="M8 13h8" />
                                        <path d="M8 17h8" />
                                    </svg>
                                    Administrative Certificates
                                </NavLink>
                            )}

                            {isAssetResponsible && (
                                <NavLink to="/dashboard/external-maintenances" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                    </svg>
                                    External Maintenances
                                </NavLink>
                            )}

                            {(isExploitationChief || isStockConsumableResponsible) && (
                                <>
                                    {isStockConsumableResponsible && (
                                        <NavLink to="/dashboard/item-requests-inbox" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 12h6" />
                                                <path d="M9 16h6" />
                                                <path d="M9 8h6" />
                                                <path d="M7 22h10a2 2 0 0 0 2-2V6l-4-4H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
                                                <path d="M15 2v4h4" />
                                            </svg>
                                            Item Requests Inbox
                                        </NavLink>
                                    )}

                                    <NavLink to="/dashboard/stock-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        Stock Items
                                    </NavLink>

                                    <NavLink to="/dashboard/consumables" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                        Consumables
                                    </NavLink>
                                </>
                            )}
                        </div>
                    )}

                    {(isSuperuser || isMaintenanceChief || isMaintenanceTechnician) && (
                        <div className="nav-section">
                            <span className="nav-section-title">Maintenance</span>
                            
                            <NavLink to="/dashboard/maintenances" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                                Maintenance
                            </NavLink>
                        </div>
                    )}
                </nav>

                <div className="sidebar-footer">
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
                        <div className="user-details">
                            <div className="user-name">{getFullName()}</div>
                            <div className="user-role">{getRoleLabel()}</div>
                        </div>
                        {isUserMenuOpen && (
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
                                    Options
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
                                    Profile
                                </button>
                            </div>
                        )}
                        <button
                            className="logout-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLogout();
                            }}
                            title="Logout"
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
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
