import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useColorPalette } from '../context/useColorPalette';
import { useTheme } from '../context/useTheme';
import { dashboardService } from '../services/api';
import LiquidEther from '../components/LiquidEther';

const DashboardHome = () => {
    const { user, isSuperuser } = useAuth();
    const { isRed, isOrange, isGreen } = useColorPalette();
    const { isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [kpis, setKpis] = useState(null);

    const getFullName = () => {
        if (user?.person) {
            if (i18n.language === 'ar' && (user.person.first_name_ar || user.person.last_name_ar)) {
                const first = user.person.first_name_ar || user.person.first_name;
                const last = user.person.last_name_ar || user.person.last_name;
                return `${first} ${last}`;
            }
            return `${user.person.first_name} ${user.person.last_name}`;
        }
        return user?.username || t('common.user');
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await dashboardService.getKpis();
                if (mounted) setKpis(data);
            } catch (e) {
                if (mounted) setKpis(null);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const roleCodes = useMemo(() => {
        return Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : [];
    }, [user]);

    const canAccessAny = (allowedRoles) => {
        if (isSuperuser) return true;
        if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;
        return allowedRoles.some((r) => roleCodes.includes(r));
    };

    const roleLabels = useMemo(() => {
        if (isSuperuser) return [t('common.superuser')];
        if (!Array.isArray(user?.roles) || user.roles.length === 0) return [t('common.user')];
        const labels = user.roles.map((r) => r?.role_label).filter(Boolean);
        return labels.length > 0 ? labels : [t('common.user')];
    }, [isSuperuser, t, user]);

    const sections = useMemo(() => {
        const catalog = [
            {
                sectionKey: 'work',
                title: t('navSections.my'),
                items: [
                    {
                        key: 'my_items',
                        title: t('nav.myItems'),
                        subtitle: t('assets.myItems'),
                        to: '/dashboard/my-items',
                        visible: true,
                        iconBg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                    },
                    {
                        key: 'my_reports',
                        title: t('nav.myReports'),
                        subtitle: t('nav.myReports'),
                        to: '/dashboard/my-reports',
                        visible: true,
                        iconBg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    },
                    {
                        key: 'options',
                        title: t('nav.options'),
                        subtitle: t('nav.options'),
                        to: '/dashboard/options',
                        visible: true,
                        iconBg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    },
                ],
            },
            {
                sectionKey: 'operations',
                title: t('navSections.operations'),
                items: [
                    {
                        key: 'maintenances',
                        title: t('nav.maintenances'),
                        subtitle: t('maintenances.title'),
                        to: '/dashboard/maintenances',
                        visible: canAccessAny(['maintenance_chief', 'it_maintenance_technician', 'it_bureau_chief', 'network_maintenance_technician']),
                        iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    },
                    {
                        key: 'location_inventory',
                        title: t('nav.locationInventory') || t('locationInventory.title'),
                        subtitle: t('locationInventory.title'),
                        to: '/dashboard/location-inventory',
                        visible: canAccessAny(['asset_responsible', 'exploitation_chief', 'it_bureau_chief', 'maintenance_chief', 'it_maintenance_technician', 'network_maintenance_technician']),
                        iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    },
                    {
                        key: 'incident_reports',
                        title: t('assetIncidentReports.title'),
                        subtitle: t('assetIncidentReports.title'),
                        to: '/dashboard/incident-reports',
                        visible: true,
                        iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    },
                ],
            },
            {
                sectionKey: 'inventory',
                title: t('navSections.inventory'),
                items: [
                    {
                        key: 'assets',
                        title: t('nav.assets'),
                        subtitle: t('assets.title'),
                        to: '/dashboard/assets',
                        visible: canAccessAny(['asset_responsible', 'exploitation_chief', 'it_bureau_chief']),
                        iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    },
                    {
                        key: 'attribution_orders',
                        title: t('nav.attributionOrders'),
                        subtitle: t('nav.attributionOrders'),
                        to: '/dashboard/attribution-orders',
                        visible: canAccessAny(['asset_responsible', 'exploitation_chief', 'it_bureau_chief']),
                        iconBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    },
                    {
                        key: 'stock_items',
                        title: t('nav.stockItems'),
                        subtitle: t('stockItems.title'),
                        to: '/dashboard/stock-items',
                        visible: canAccessAny(['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']),
                        iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    },
                    {
                        key: 'consumables',
                        title: t('nav.consumables'),
                        subtitle: t('consumables.title'),
                        to: '/dashboard/consumables',
                        visible: canAccessAny(['stock_consumable_responsible', 'exploitation_chief', 'it_bureau_chief']),
                        iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    },
                    {
                        key: 'stock_consumables_inventory',
                        title: t('stockConsumablesInventory.title'),
                        subtitle: t('stockConsumablesInventory.title'),
                        to: '/dashboard/stock-consumables-inventory',
                        visible: canAccessAny(['stock_consumable_responsible', 'exploitation_chief']),
                        iconBg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                    },
                ],
            },
            {
                sectionKey: 'reporting',
                title: t('navSections.reports'),
                items: [
                    {
                        key: 'reports',
                        title: t('nav.reports'),
                        subtitle: t('reports.title'),
                        to: '/dashboard/reports',
                        visible: canAccessAny(['maintenance_chief', 'it_bureau_chief']),
                        iconBg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    },
                    {
                        key: 'maintenance_stats',
                        title: t('maintenanceStats.title'),
                        subtitle: t('maintenanceStats.title'),
                        to: '/dashboard/maintenance-stats',
                        visible: canAccessAny(['maintenance_chief', 'it_bureau_chief']),
                        iconBg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    },
                    {
                        key: 'my_maintenance_stats',
                        title: t('myMaintenanceStats.title'),
                        subtitle: t('myMaintenanceStats.title'),
                        to: '/dashboard/my-maintenance-stats',
                        visible: canAccessAny(['it_maintenance_technician', 'network_maintenance_technician']),
                        iconBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    },
                ],
            },
            {
                sectionKey: 'procurement',
                title: t('navSections.procurement'),
                items: [
                    {
                        key: 'purchase_orders',
                        title: t('nav.purchaseOrders'),
                        subtitle: t('purchaseOrders.title'),
                        to: '/dashboard/purchase-orders',
                        visible: canAccessAny(['stock_consumable_responsible', 'exploitation_chief', 'director_admin_support', 'protection_and_security_bureau_chief', 'school_headquarter', 'it_bureau_chief']),
                        iconBg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                    },
                    {
                        key: 'item_requests_inbox',
                        title: t('itemRequestsInbox.title'),
                        subtitle: t('itemRequestsInbox.title'),
                        to: '/dashboard/item-requests-inbox',
                        visible: canAccessAny(['stock_consumable_responsible', 'exploitation_chief']),
                        iconBg: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
                    },
                    {
                        key: 'included_item_movements_approval',
                        title: t('includedItemMovementsApproval.title'),
                        subtitle: t('includedItemMovementsApproval.title'),
                        to: '/dashboard/included-item-movements-approval',
                        visible: canAccessAny(['stock_consumable_responsible', 'exploitation_chief']),
                        iconBg: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    },
                ],
            },
            {
                sectionKey: 'admin',
                title: t('nav.administration'),
                items: [
                    {
                        key: 'persons',
                        title: t('nav.persons'),
                        subtitle: t('persons.title'),
                        to: '/dashboard/persons',
                        visible: isSuperuser,
                        iconBg: 'var(--gradient-primary)',
                    },
                    {
                        key: 'user_approval',
                        title: t('nav.userApproval'),
                        subtitle: t('userApproval.subtitle'),
                        to: '/dashboard/user-approval',
                        visible: isSuperuser,
                        iconBg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    },
                    {
                        key: 'organizational_structure',
                        title: t('nav.organizationalStructure'),
                        subtitle: t('nav.organizationalStructure'),
                        to: '/dashboard/organizational-structure',
                        visible: isSuperuser,
                        iconBg: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                    },
                    {
                        key: 'locations',
                        title: t('nav.locations'),
                        subtitle: t('nav.locations'),
                        to: '/dashboard/locations',
                        visible: isSuperuser,
                        iconBg: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)',
                    },
                ],
            },
        ];

        return catalog
            .map((s) => ({
                ...s,
                items: s.items.filter((i) => i.visible),
            }))
            .filter((s) => s.items.length > 0);
    }, [canAccessAny, isSuperuser, t]);

    const kpiCards = useMemo(() => {
        if (!kpis) return [];

        const cards = [];

        if (kpis?.my_items) {
            cards.push({
                key: 'my_assets',
                label: t('nav.myItems'),
                value: (kpis.my_items.assets || 0) + (kpis.my_items.stock_items || 0) + (kpis.my_items.consumables || 0),
                helper: t('common.total'),
            });
        }

        if (kpis?.maintenances) {
            cards.push({
                key: 'open_maintenances',
                label: t('nav.maintenances'),
                value: kpis.maintenances.open || 0,
                helper: t('common.open'),
                onClick: () => navigate('/dashboard/maintenances'),
            });

            if (typeof kpis.maintenances.awaiting_approval === 'number' && kpis.maintenances.awaiting_approval > 0) {
                cards.push({
                    key: 'maint_approval',
                    label: t('common.pending'),
                    value: kpis.maintenances.awaiting_approval,
                    helper: t('maintenances.title'),
                    onClick: () => navigate('/dashboard/maintenances'),
                });
            }
        }

        if (kpis?.procurement) {
            if (typeof kpis.procurement.pending_item_requests === 'number') {
                cards.push({
                    key: 'item_requests',
                    label: t('itemRequestsInbox.title'),
                    value: kpis.procurement.pending_item_requests,
                    helper: t('common.pending'),
                    onClick: () => navigate('/dashboard/item-requests-inbox'),
                });
            }
            if (typeof kpis.procurement.purchase_orders_with_remaining === 'number') {
                cards.push({
                    key: 'po_remaining',
                    label: t('purchaseOrders.title'),
                    value: kpis.procurement.purchase_orders_with_remaining,
                    helper: t('common.pending'),
                    onClick: () => navigate('/dashboard/purchase-orders'),
                });
            }
        }

        if (kpis?.incidents && typeof kpis.incidents.pending_signatures === 'number') {
            cards.push({
                key: 'incident_signatures',
                label: t('assetIncidentReports.title'),
                value: kpis.incidents.pending_signatures,
                helper: t('common.pending'),
                onClick: () => navigate('/dashboard/incident-reports'),
            });
        }

        return cards;
    }, [kpis, navigate, t]);

    return (
        <>
            <div className="dashboard-hero">
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <LiquidEther
                        colors={isDark ? (isRed ? ['#FF2727', '#FF9F9F', '#CF7B7B'] : isOrange ? ['#FF8C27', '#FFCF9F', '#CF9B5B'] : isGreen ? ['#22C55E', '#86EFAC', '#6EE7B7'] : ['#5227FF', '#FF9FFC', '#B497CF']) : (isRed ? ['#F87171', '#FECACA', '#FCA5A5'] : isOrange ? ['#FB923C', '#FED7AA', '#FDBA74'] : isGreen ? ['#4ADE80', '#BBF7D0', '#86EFAC'] : ['#A78BFA', '#DDD6FE', '#C4B5FD'])}
                        mouseForce={20}
                        cursorSize={100}
                        isViscous={false}
                        viscous={30}
                        iterationsViscous={32}
                        iterationsPoisson={32}
                        resolution={0.5}
                        isBounce={false}
                        autoDemo={true}
                        autoSpeed={0.5}
                        autoIntensity={2.2}
                        takeoverDuration={0.25}
                        autoResumeDelay={3000}
                        autoRampDuration={0.6}
                    />
                </div>
                <div className="dashboard-hero-main" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="dashboard-hero-kicker">{t('app.title')}</div>
                    <h1 className="dashboard-hero-title">{t('common.welcome')}, {getFullName()}!</h1>
                    <div className="dashboard-hero-meta">
                        {roleLabels.map((label) => (
                            <span key={label} className="dashboard-role-pill">{label}</span>
                        ))}
                    </div>
                </div>

                <div className="dashboard-hero-actions" style={{ position: 'relative', zIndex: 1 }}>
                    <button type="button" className="dashboard-quick-btn" onClick={() => navigate('/dashboard/my-items')}>
                        {t('nav.myItems')}
                    </button>
                    <button type="button" className="dashboard-quick-btn" onClick={() => navigate('/dashboard/incident-reports')}>
                        {t('assetIncidentReports.title')}
                    </button>
                    <button type="button" className="dashboard-quick-btn" onClick={() => navigate('/dashboard/options')}>
                        {t('nav.options')}
                    </button>
                </div>
            </div>

            {kpiCards.length > 0 && (
                <div className="dashboard-kpis" role="region" aria-label={t('nav.dashboard')}>
                    {kpiCards.map((k) => (
                        <button
                            key={k.key}
                            type="button"
                            className="dashboard-kpi"
                            onClick={k.onClick || undefined}
                            disabled={!k.onClick}
                        >
                            <div className="dashboard-kpi-value">{k.value}</div>
                            <div className="dashboard-kpi-label">{k.label}</div>
                            <div className="dashboard-kpi-helper">{k.helper}</div>
                        </button>
                    ))}
                </div>
            )}

            <div className="dashboard-sections">
                {sections.map((section) => (
                    <div key={section.sectionKey} className="dashboard-section">
                        <div className="dashboard-section-head">
                            <h2 className="dashboard-section-title">{section.title}</h2>
                        </div>

                        <div className="dashboard-grid">
                            {section.items.map((c) => (
                                <button
                                    key={c.key}
                                    type="button"
                                    className="dashboard-tile"
                                    onClick={() => navigate(c.to)}
                                >
                                    <div className="dashboard-tile-icon" style={{ background: c.iconBg }} aria-hidden="true" />
                                    <div className="dashboard-tile-content">
                                        <div className="dashboard-tile-title">{c.title}</div>
                                        <div className="dashboard-tile-subtitle">{c.subtitle}</div>
                                    </div>
                                    <div className="dashboard-tile-arrow" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default DashboardHome;
