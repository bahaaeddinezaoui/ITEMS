import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../services/api';
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
            setError('Failed to load your performance statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Curating your personal dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message animate-fade-in-up">
                <AlertCircle className="w-6 h-6" />
                <div>
                    <strong>{error}</strong>
                    <p>There was a problem loading your data. Please try again.</p>
                </div>
                <button 
                    onClick={fetchStats}
                    className="btn btn-secondary"
                    style={{ marginLeft: 'auto', width: 'auto' }}
                >
                    <RotateCcw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    const { summary, monthly_trend } = data;

    return (
        <div className="page-container animate-fade-in-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Personal Analytics</h1>
                    <p className="page-subtitle">Track your individual performance, achievements, and workload history</p>
                </div>
                <button onClick={fetchStats} className="btn btn-secondary" style={{ width: 'auto' }}>
                    <RotateCcw className="w-4 h-4" /> Refresh Stats
                </button>
            </header>

            {/* Metric Cards Grid */}
            <section className="metric-grid">
                <MetricCard 
                    title="Total Operations" 
                    value={summary.total_maintenances} 
                    icon={<Settings size={22} />}
                    color="blue"
                    subtext="All-time assigned tasks"
                />
                <MetricCard 
                    title="My Success Rate" 
                    value={`${Math.round(summary.success_rate)}%`} 
                    icon={<CheckCircle2 size={22} />}
                    color="emerald"
                    subtext="Average quality score"
                />
                <MetricCard 
                    title="Efficiency" 
                    value={`${summary.avg_duration_hours}h`} 
                    icon={<Clock size={22} />}
                    color="violet"
                    subtext="Avg time per resolve"
                />
                <MetricCard 
                    title="Active Tasks" 
                    value={summary.pending_maintenances} 
                    icon={<Activity size={22} />}
                    color="amber"
                    subtext="Operations in progress"
                />
            </section>

            <div className="stats-container">
                {/* Monthly Activity */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} color="var(--color-primary)" />
                            Recent Monthly Trends
                        </h2>
                    </div>
                    <div className="card-body">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Month Period</th>
                                        <th>Task Volume</th>
                                        <th>Success Ratio</th>
                                        <th>Achievement Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthly_trend.map((item, idx) => {
                                        const date = new Date(item.month);
                                        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                                        const successRate = item.count > 0 ? (item.successful / item.count) * 100 : 0;
                                        
                                        return (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 700 }}>{monthName}</td>
                                                <td>{item.count} operations</td>
                                                <td>
                                                    <span className={`badge ${successRate >= 90 ? 'badge-success' : 'badge-info'}`}>
                                                        {item.successful} Resolved
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
                                                <p>No activity data available for the last 6 months.</p>
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
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 850, letterSpacing: '-0.02em', marginBottom: '8px' }}>Performance Status</h2>
                            <p style={{ opacity: 0.9, fontSize: 'var(--font-size-sm)', maxWidth: '240px', margin: '0 auto' }}>
                                You have maintained a <strong>{Math.round(summary.success_rate)}%</strong> success rate across your last {summary.total_maintenances} tasks.
                            </p>
                        </div>
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '24px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6, letterSpacing: '0.1em', marginBottom: '8px' }}>CURRENT RATING</div>
                            <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                {summary.success_rate >= 90 ? 'Eminent' : summary.success_rate >= 75 ? 'Expert' : summary.success_rate >= 50 ? 'Steady' : 'Developing'}
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
