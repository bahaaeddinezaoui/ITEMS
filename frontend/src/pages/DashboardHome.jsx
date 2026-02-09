const DashboardHome = () => {
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome to the Equipment Management System</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Stats Cards */}
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--gradient-primary)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--space-4)'
                        }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                            Persons
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            Manage registered personnel
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--space-4)'
                        }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                            Assets
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            Track equipment & assets
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--space-4)'
                        }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                            Maintenance
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            Schedule & track repairs
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardHome;
