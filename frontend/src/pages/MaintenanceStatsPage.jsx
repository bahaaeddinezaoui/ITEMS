import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
    Users, 
    CheckCircle2, 
    Clock, 
    Settings, 
    BarChart3,
    TrendingUp,
    AlertCircle,
    RotateCcw,
    Activity
} from 'lucide-react';

const MaintenanceStatsPage = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await maintenanceService.getTechnicianStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(t('maintenanceStats.loadError'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>{t('maintenanceStats.fetchingAnalytics')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message animate-fade-in-up">
                <AlertCircle className="w-6 h-6" />
                <div>
                    <strong>{error}</strong>
                    <p>{t('maintenanceStats.connectionError')}</p>
                </div>
                <button 
                    onClick={fetchStats}
                    className="btn btn-secondary"
                    style={{ marginLeft: 'auto', width: 'auto' }}
                >
                    <RotateCcw className="w-4 h-4" /> {t('maintenanceStats.retry')}
                </button>
            </div>
        );
    }

    // Overall metrics
    const totalMaintenances = stats.reduce((acc, s) => acc + s.total_maintenances, 0);
    const totalCompleted = stats.reduce((acc, s) => acc + s.completed_maintenances, 0);
    const overallSuccessRate = totalCompleted > 0 
        ? (stats.reduce((acc, s) => acc + s.successful_maintenances, 0) / totalCompleted) * 100
        : 0;

    return (
        <div className="page-container animate-fade-in-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">{t('maintenanceStats.title')}</h1>
                    <p className="page-subtitle">{t('maintenanceStats.subtitle')}</p>
                </div>
                <button onClick={fetchStats} className="btn btn-secondary" style={{ width: 'auto' }}>
                    <RotateCcw className="w-4 h-4" /> {t('maintenanceStats.refreshData')}
                </button>
            </header>

            {/* Metric Cards Grid */}
            <section className="metric-grid">
                <MetricCard 
                    title={t('maintenanceStats.totalTasks')} 
                    value={totalMaintenances} 
                    icon={<Settings size={22} />}
                    color="blue"
                    subtext={t('maintenanceStats.cumulativeOps')}
                />
                <MetricCard 
                    title={t('maintenanceStats.avgSuccess')} 
                    value={`${Math.round(overallSuccessRate)}%`} 
                    icon={<CheckCircle2 size={22} />}
                    color="emerald"
                    subtext={t('maintenanceStats.completedTasks')}
                />
                <MetricCard 
                    title={t('maintenanceStats.staff')} 
                    value={stats.length} 
                    icon={<Users size={22} />}
                    color="violet"
                    subtext={t('maintenanceStats.activeTechnicians')}
                />
                <MetricCard 
                    title={t('maintenanceStats.active')} 
                    value={stats.reduce((acc, s) => acc + s.pending_maintenances, 0)} 
                    icon={<Activity size={22} />}
                    color="amber"
                    subtext={t('maintenanceStats.tasksInProgress')}
                />
            </section>

            <div className="stats-container">
                {/* Leaderboard */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={20} color="var(--color-primary)" />
                            {t('maintenanceStats.staffEfficiencyRanking')}
                        </h2>
                    </div>
                    <div className="card-body">
                        <div className="table-container">
                            <table className="data-table leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>{t('maintenanceStats.technician')}</th>
                                        <th>{t('maintenanceStats.volume')}</th>
                                        <th>{t('maintenanceStats.successRate')}</th>
                                        <th>{t('maintenanceStats.avgTime')}</th>
                                        <th>{t('maintenanceStats.availability')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((tech) => (
                                        <tr key={tech.performed_by_person_id}>
                                            <td>
                                                <div className="tech-info">
                                                    <div className="tech-avatar">
                                                        {tech.performed_by_person__first_name[0]}{tech.performed_by_person__last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-primary">
                                                            {tech.performed_by_person__first_name} {tech.performed_by_person__last_name}
                                                        </div>
                                                        <div className="metric-subtext">ID: #{tech.performed_by_person_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>{tech.total_maintenances}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
                                                    <div className="progress-container">
                                                        <div 
                                                            className={`progress-bar ${
                                                                tech.success_rate >= 90 ? 'progress-emerald' : tech.success_rate >= 75 ? 'progress-primary' : 'progress-amber'
                                                            }`}
                                                            style={{ width: `${tech.success_rate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{tech.success_rate}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={14} color="var(--color-text-muted)" />
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{tech.avg_duration_hours}h</span>
                                                </div>
                                            </td>
                                            <td>
                                                {tech.pending_maintenances > 0 ? (
                                                    <span className="badge badge-warning">{tech.pending_maintenances} {t('maintenanceStats.active')}</span>
                                                ) : (
                                                    <span className="badge badge-success">{t('maintenanceStats.idle')}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Workload */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarChart3 size={20} color="var(--color-primary)" />
                            {t('maintenanceStats.workloadRatio')}
                        </h2>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats.length > 0 ? stats.slice(0, 8).map((tech) => (
                            <div key={tech.performed_by_person_id} className="workload-item">
                                <div className="workload-header">
                                    <div>
                                        <span className="workload-name">{tech.performed_by_person__first_name}</span>
                                        <div className="workload-stats">
                                            <span className="badge badge-success" style={{ fontSize: '8px', padding: '1px 6px' }}>{tech.successful_maintenances} OK</span>
                                            <span className="badge badge-error" style={{ fontSize: '8px', padding: '1px 6px' }}>{tech.failed_maintenances} ERR</span>
                                        </div>
                                    </div>
                                    <div className="workload-percentage">
                                        <span className="workload-value">
                                            {Math.round((tech.total_maintenances / (totalMaintenances || 1)) * 100)}
                                        </span>
                                        <span className="workload-unit">%</span>
                                    </div>
                                </div>
                                <div className="progress-container" style={{ height: '6px' }}>
                                    <div 
                                        className="progress-bar progress-blue"
                                        style={{ width: `${(tech.total_maintenances / (totalMaintenances || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                                <Activity size={48} style={{ opacity: 0.1, marginBottom: '12px' }} />
                                <p>{t('maintenanceStats.noData')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, subtext, color = 'blue' }) => (
    <div className={`metric-card color-${color}`}>
        <div className="metric-info">
            <span className="metric-title">{title}</span>
            <h3 className="metric-value">{value}</h3>
            <span className="metric-subtext">{subtext}</span>
        </div>
        <div className="metric-icon-box">
            {icon}
        </div>
    </div>
);

export default MaintenanceStatsPage;
