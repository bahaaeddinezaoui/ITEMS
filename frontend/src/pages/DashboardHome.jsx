import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardHome = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();

    const getFullName = () => {
        if (user?.person) {
            return `${user.person.first_name} ${user.person.last_name}`;
        }
        return user?.username || 'User';
    };

    const roleCodes = useMemo(() => {
        return Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : [];
    }, [user]);

    const isMaintenanceChief = isSuperuser || roleCodes.includes('maintenance_chief');
    const isMaintenanceTechnician = roleCodes.includes('maintenance_technician');
    const isExploitationChief = isSuperuser || roleCodes.includes('exploitation_chief');
    const isStockConsumableResponsible = isSuperuser || roleCodes.includes('stock_consumable_responsible');
    const isAssetResponsible = isSuperuser || roleCodes.includes('asset_responsible');

    const cards = useMemo(() => {
        const all = [
            {
                key: 'persons',
                title: 'Persons',
                subtitle: 'Manage registered personnel',
                to: '/dashboard/persons',
                visible: isSuperuser,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                ),
                iconBg: 'var(--gradient-primary)',
            },
            {
                key: 'assets',
                title: 'Assets',
                subtitle: 'Track equipment & assets',
                to: '/dashboard/assets',
                visible: isAssetResponsible || isExploitationChief,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                ),
                iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            },
            {
                key: 'stock_items',
                title: 'Stock Items',
                subtitle: 'Manage stock items inventory',
                to: '/dashboard/stock-items',
                visible: isStockConsumableResponsible || isExploitationChief,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                ),
                iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            },
            {
                key: 'consumables',
                title: 'Consumables',
                subtitle: 'Manage consumables inventory',
                to: '/dashboard/consumables',
                visible: isStockConsumableResponsible || isExploitationChief,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                ),
                iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            },
            {
                key: 'attribution_orders',
                title: 'Attribution Orders',
                subtitle: 'Create and consult attribution orders',
                to: '/dashboard/attribution-orders',
                visible: isAssetResponsible,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                ),
                iconBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            },
            {
                key: 'reports',
                title: 'Reports',
                subtitle: 'Consult and manage problem reports',
                to: '/dashboard/reports',
                visible: isMaintenanceChief || isExploitationChief,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M3 3h18v18H3z" />
                        <path d="M7 7h10" />
                        <path d="M7 12h10" />
                        <path d="M7 17h6" />
                    </svg>
                ),
                iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            },
            {
                key: 'maintenance',
                title: 'Maintenance',
                subtitle: 'Schedule & track repairs',
                to: '/dashboard/maintenances',
                visible: isMaintenanceChief || isMaintenanceTechnician,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                ),
                iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            },
            {
                key: 'my_items',
                title: 'My Items',
                subtitle: 'View what you own and report problems',
                to: '/dashboard/my-items',
                visible: true,
                icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                ),
                iconBg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
            },
        ];

        return all.filter((c) => c.visible);
    }, [isAssetResponsible, isExploitationChief, isMaintenanceChief, isMaintenanceTechnician, isStockConsumableResponsible, isSuperuser]);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Welcome, {getFullName()}!</h1>
                <p className="page-subtitle">Here's your Equipment Management System dashboard</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                {cards.map((c) => (
                    <div
                        key={c.key}
                        className="card"
                        onClick={() => navigate(c.to)}
                        style={{ cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate(c.to);
                            }
                        }}
                    >
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: c.iconBg,
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto var(--space-4)',
                                }}
                            >
                                {c.icon}
                            </div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>{c.title}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{c.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default DashboardHome;
