import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user, logout, isSuperuser } = useAuth();
    const navigate = useNavigate();

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
                    {isSuperuser && (
                        <>
                            <div className="nav-section">
                                <span className="nav-section-title">Main Menu</span>

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
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{getInitials()}</div>
                        <div className="user-details">
                            <div className="user-name">{getFullName()}</div>
                            <div className="user-role">{getRoleLabel()}</div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout} title="Logout">
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
