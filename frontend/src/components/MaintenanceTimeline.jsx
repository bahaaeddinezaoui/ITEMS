import { useMemo, useState } from 'react';

const MaintenanceTimeline = ({ maintenances, steps }) => {
    const [expandedMaintenances, setExpandedMaintenances] = useState({});

    const toggleMaintenance = (maintenanceId) => {
        setExpandedMaintenances(prev => ({
            ...prev,
            [maintenanceId]: !prev[maintenanceId]
        }));
    };

    const timelineData = useMemo(() => {
        if (!Array.isArray(maintenances) || !Array.isArray(steps)) {
            return { maintenances: [], stepsByMaintenance: {} };
        }

        // Group steps by maintenance
        const stepsByMaintenance = {};
        for (const step of steps) {
            const mid = step.maintenance;
            if (!stepsByMaintenance[mid]) {
                stepsByMaintenance[mid] = [];
            }
            stepsByMaintenance[mid].push(step);
        }

        // Sort maintenances by start_datetime (most recent first)
        const sortedMaintenances = [...maintenances].sort((a, b) => {
            const aTime = a.start_datetime ? new Date(a.start_datetime).getTime() : 0;
            const bTime = b.start_datetime ? new Date(b.start_datetime).getTime() : 0;
            return bTime - aTime;
        });

        return { maintenances: sortedMaintenances, stepsByMaintenance };
    }, [maintenances, steps]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status) => {
        if (!status) return 'var(--color-text-secondary)';
        const s = status.toLowerCase();
        if (s.includes('done') || s === 'completed') return 'var(--color-success)';
        if (s.includes('fail') || s.includes('cancel')) return 'var(--color-error)';
        if (s.includes('progress') || s.includes('start')) return 'var(--color-info)';
        if (s.includes('pending') || s.includes('wait')) return 'var(--color-warning)';
        return 'var(--color-text-secondary)';
    };

    const getStepStatusIcon = (status) => {
        if (!status) return '○';
        const s = status.toLowerCase();
        if (s.includes('done')) return '✓';
        if (s.includes('fail')) return '✗';
        if (s.includes('cancel')) return '⊘';
        if (s.includes('progress') || s.includes('start')) return '◐';
        if (s.includes('pending') || s.includes('wait')) return '○';
        return '○';
    };

    if (timelineData.maintenances.length === 0) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">No Maintenance History</h3>
                <p className="empty-state-text">No maintenance records found for assets you reported problems on.</p>
            </div>
        );
    }

    return (
        <div className="maintenance-timeline">
            <style>{`
                .maintenance-timeline {
                    position: relative;
                    padding-left: 2rem;
                }
                .maintenance-timeline::before {
                    content: '';
                    position: absolute;
                    left: 0.75rem;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--color-border);
                }
                .timeline-entry {
                    position: relative;
                    padding-bottom: 1.5rem;
                }
                .timeline-entry:last-child {
                    padding-bottom: 0;
                }
                .timeline-marker {
                    position: absolute;
                    left: -1.5rem;
                    top: 0.25rem;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: var(--color-bg-primary);
                    border: 2px solid var(--color-border);
                    z-index: 1;
                }
                .timeline-marker.maintenance-marker {
                    background: var(--color-primary);
                    border-color: var(--color-primary);
                    color: white;
                }
                .timeline-marker.step-marker {
                    background: var(--color-bg-primary);
                    border-color: var(--color-border);
                    color: var(--color-text-secondary);
                }
                .timeline-content {
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 1rem;
                    margin-left: 0.5rem;
                }
                .timeline-content.maintenance-content {
                    background: var(--color-bg-tertiary);
                    border-left: 3px solid var(--color-primary);
                }
                .timeline-content.step-content {
                    background: var(--color-bg-secondary);
                    margin-left: 1rem;
                }
                .timeline-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .timeline-title {
                    font-weight: 600;
                    font-size: var(--font-size-md);
                    color: var(--color-text-primary);
                    margin: 0;
                }
                .timeline-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-size-xs);
                    font-weight: 500;
                    background: var(--color-bg-secondary);
                    color: var(--color-text-secondary);
                }
                .timeline-times {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin-top: 0.5rem;
                }
                .timeline-time-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                }
                .timeline-time-label {
                    font-size: var(--font-size-xs);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    opacity: 0.7;
                }
                .timeline-time-value {
                    font-weight: 500;
                }
                .timeline-performer {
                    margin-top: 0.5rem;
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                }
                .timeline-performer strong {
                    color: var(--color-text-primary);
                }
                .timeline-step-description {
                    margin-top: 0.25rem;
                    font-size: var(--font-size-sm);
                    color: var(--color-text-primary);
                }
            `}</style>

            {timelineData.maintenances.map((m) => {
                const isExpanded = expandedMaintenances[m.maintenance_id];
                const maintenanceSteps = timelineData.stepsByMaintenance[m.maintenance_id] || [];
                const sortedSteps = [...maintenanceSteps].sort((a, b) => a.maintenance_step_id - b.maintenance_step_id);

                return (
                    <div key={`maintenance-${m.maintenance_id}`} className="timeline-entry">
                        <div className="timeline-marker maintenance-marker">
                            M
                        </div>
                        <div 
                            className="timeline-content maintenance-content"
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleMaintenance(m.maintenance_id)}
                        >
                            <div className="timeline-header">
                                <h4 className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        transition: 'transform 0.2s',
                                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                                    }}>▶</span>
                                    Maintenance #{m.maintenance_id}
                                    {m.description && ` - ${m.description}`}
                                </h4>
                                {m.maintenance_status && (
                                    <span 
                                        className="timeline-badge"
                                        style={{ 
                                            backgroundColor: getStatusColor(m.maintenance_status),
                                            color: 'white'
                                        }}
                                    >
                                        {m.maintenance_status}
                                    </span>
                                )}
                            </div>
                            <div className="timeline-times">
                                <div className="timeline-time-item">
                                    <span className="timeline-time-label">Started</span>
                                    <span className="timeline-time-value">{formatDateTime(m.start_datetime)}</span>
                                </div>
                                <div className="timeline-time-item">
                                    <span className="timeline-time-label">Ended</span>
                                    <span className="timeline-time-value">{formatDateTime(m.end_datetime)}</span>
                                </div>
                            </div>
                            {m.performed_by_person_name && (
                                <div className="timeline-performer">
                                    <strong>Technician:</strong> {m.performed_by_person_name}
                                </div>
                            )}
                            <div style={{ marginTop: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                {maintenanceSteps.length} step{maintenanceSteps.length !== 1 ? 's' : ''} • Click to {isExpanded ? 'collapse' : 'expand'}
                            </div>
                        </div>

                        {isExpanded && sortedSteps.length > 0 && (
                            <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                                {sortedSteps.map((step) => {
                                    const statusColor = getStatusColor(step.maintenance_step_status);
                                    const statusIcon = getStepStatusIcon(step.maintenance_step_status);
                                    const description = step.maintenance_typical_step?.description || step.maintenance_step_status || 'Step';
                                    const performerName = step.person?.first_name 
                                        ? `${step.person.first_name} ${step.person.last_name || ''}`.trim()
                                        : null;

                                    return (
                                        <div key={`step-${step.maintenance_step_id}`} className="timeline-entry">
                                            <div 
                                                className="timeline-marker step-marker"
                                                style={{ borderColor: statusColor, color: statusColor }}
                                            >
                                                {statusIcon}
                                            </div>
                                            <div className="timeline-content step-content">
                                                <div className="timeline-header">
                                                    <h4 className="timeline-title">
                                                        Step #{step.maintenance_step_id}: {description}
                                                    </h4>
                                                    {step.maintenance_step_status && (
                                                        <span 
                                                            className="timeline-badge"
                                                            style={{ 
                                                                backgroundColor: statusColor,
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {step.maintenance_step_status}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="timeline-times">
                                                    <div className="timeline-time-item">
                                                        <span className="timeline-time-label">Started</span>
                                                        <span className="timeline-time-value">{formatDateTime(step.start_datetime)}</span>
                                                    </div>
                                                    <div className="timeline-time-item">
                                                        <span className="timeline-time-label">Ended</span>
                                                        <span className="timeline-time-value">{formatDateTime(step.end_datetime)}</span>
                                                    </div>
                                                </div>
                                                {performerName && (
                                                    <div className="timeline-performer">
                                                        <strong>Performer:</strong> {performerName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MaintenanceTimeline;
