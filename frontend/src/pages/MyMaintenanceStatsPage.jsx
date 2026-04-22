import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../services/api';
import { useTranslation, Trans } from 'react-i18next';
import { 
    CheckCircle2, 
    Clock, 
    Settings, 
    TrendingUp,
    AlertCircle,
    RotateCcw,
    Activity,
    Calendar,
    Trophy
} from 'lucide-react';

const MyMaintenanceStatsPage = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const stats = await maintenanceService.getMyMaintenanceStats();
            setData(stats);
            setError(null);
        } catch (err) {
            setError(t('myMaintenanceStats.loadError'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>{t('myMaintenanceStats.curatingDashboard')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message animate-fade-in-up">
                <AlertCircle className="w-6 h-6" />
                <div>
                    <strong>{error}</strong>
                    <p>{t('myMaintenanceStats.loadProblem')}</p>
                </div>
                <button 
                    onClick={fetchStats}
                    className="btn btn-secondary"
                    style={{ marginLeft: 'auto', width: 'auto' }}
                >
                    <RotateCcw className="w-4 h-4" /> {t('common.tryAgain')}
                </button>
            </div>
        );
    }

    const { summary, monthly_trend } = data;

    return (
        <div className="page-container animate-fade-in-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">{t('myMaintenanceStats.title')}</h1>
                    <p className="page-subtitle">{t('myMaintenanceStats.subtitle')}</p>
                </div>
                <button onClick={fetchStats} className="btn btn-secondary" style={{ width: 'auto' }}>
                    <RotateCcw className="w-4 h-4" /> {t('myMaintenanceStats.refreshStats')}
                </button>
            </header>

            {/* Metric Cards Grid */}
            <section className="metric-grid">
                <MetricCard 
                    title={t('myMaintenanceStats.totalOperations')} 
                    value={summary.total_maintenances} 
                    icon={<Settings size={22} />}
                    color="blue"
                    subtext={t('myMaintenanceStats.allTimeAssignedTasks')}
                />
                <MetricCard 
                    title={t('myMaintenanceStats.mySuccessRate')} 
                    value={`${Math.round(summary.success_rate)}%`} 
                    icon={<CheckCircle2 size={22} />}
                    color="emerald"
                    subtext={t('myMaintenanceStats.avgQualityScore')}
                />
                <MetricCard
                    title={t('myMaintenanceStats.efficiency')}
                    value={`${summary.avg_duration_hours}${i18n.language === 'ar' ? 'سا' : 'h'}`}
                    icon={<Clock size={22} />}
                    color="violet"
                    subtext={t('myMaintenanceStats.avgTimePerResolve')}
                />
                <MetricCard 
                    title={t('myMaintenanceStats.activeTasks')} 
                    value={summary.pending_maintenances} 
                    icon={<Activity size={22} />}
                    color="amber"
                    subtext={t('myMaintenanceStats.operationsInProgress')}
                />
            </section>

            <div className="stats-container">
                {/* Monthly Activity */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} color="var(--color-primary)" />
                            {t('myMaintenanceStats.recentMonthlyTrends')}
                        </h2>
                    </div>
                    <div className="card-body">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{t('myMaintenanceStats.monthPeriod')}</th>
                                        <th>{t('myMaintenanceStats.taskVolume')}</th>
                                        <th>{t('myMaintenanceStats.successRatio')}</th>
                                        <th>{t('myMaintenanceStats.achievementRate')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthly_trend.map((item, idx) => {
                                        const date = new Date(item.month);
                                        const monthName = date.toLocaleString(i18n.language === 'ar' ? 'ar' : 'default', { month: 'long', year: 'numeric' });
                                        const successRate = item.count > 0 ? (item.successful / item.count) * 100 : 0;
                                        
                                        return (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 700 }}>{monthName}</td>
                                                <td>{t('myMaintenanceStats.operationsCount', { count: item.count })}</td>
                                                <td>
                                                    <span className={`badge ${successRate >= 90 ? 'badge-success' : 'badge-info'}`}>
                                                        {t('myMaintenanceStats.resolvedCount', { count: item.successful })}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div className="progress-container" style={{ flex: 1, height: '6px' }}>
                                                            <div 
                                                                className="progress-bar progress-primary"
                                                                style={{ width: `${successRate}%` }}
                                                            ></div>
                                                        </div>
                                                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>{Math.round(successRate)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {monthly_trend.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                                <Activity size={32} style={{ opacity: 0.1, marginBottom: '8px' }} />
                                                <p>{t('myMaintenanceStats.noActivityData')}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Score Summary Card */}
                <div 
                    className="card animate-fade-in-up" 
                    style={{ 
                        background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, #8b5cf6 100%)', 
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div className="card-body" style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', width: '72px', height: '72px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                             <Trophy size={36} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: '8px' }}>{t('myMaintenanceStats.performanceStatus')}</h2>
                            <p style={{ opacity: 0.9, fontSize: 'var(--font-size-sm)', maxWidth: '240px', margin: '0 auto' }}>
                                <Trans
                                    i18nKey="myMaintenanceStats.maintainedSuccessRate"
                                    values={{ rate: Math.round(summary.success_rate), tasks: summary.total_maintenances }}
                                    components={{ strong: <strong /> }}
                                />
                            </p>
                        </div>
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '24px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6, letterSpacing: '0.1em', marginBottom: '8px' }}>{t('myMaintenanceStats.currentRating')}</div>
                            <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                {summary.success_rate >= 90 ? t('myMaintenanceStats.ratingEminent') : summary.success_rate >= 75 ? t('myMaintenanceStats.ratingExpert') : summary.success_rate >= 50 ? t('myMaintenanceStats.ratingSteady') : t('myMaintenanceStats.ratingDeveloping')}
                            </div>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
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

export default MyMaintenanceStatsPage;
