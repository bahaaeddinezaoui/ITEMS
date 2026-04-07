import { Link } from 'react-router-dom';

const highlights = [
    {
        title: 'Assets',
        description: 'Track equipment lifecycle, ownership, and movements with clarity.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
    },
    {
        title: 'Maintenance',
        description: 'Plan interventions, follow steps, and keep history in one place.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l8.2 8.2 5.4-5.4-8.2-8.2z" />
                <path d="M8 8l-6 6v6h6l6-6" />
            </svg>
        ),
    },
    {
        title: 'Stock & Consumables',
        description: 'Control types, models, compatibility, and inventories across locations.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="6" rx="2" />
                <rect x="3" y="14" width="18" height="6" rx="2" />
                <path d="M7 7h.01M7 17h.01" />
            </svg>
        ),
    },
];

const capabilityGroups = [
    {
        title: 'Asset lifecycle',
        points: ['Types, models, and instances', 'Default composition & included items', 'Assignments and traceability'],
    },
    {
        title: 'Maintenance operations',
        points: ['Planning, steps, and execution', 'History & timelines per asset', 'Internal & external workflows'],
    },
    {
        title: 'Stock & consumables',
        points: ['Inventory per location', 'Compatibility matrices', 'Receiving and movements'],
    },
    {
        title: 'Requests & approvals',
        points: ['Incident reports', 'Item requests inbox', 'Movement approvals'],
    },
    {
        title: 'Reporting',
        points: ['Operational dashboards', 'Backorder & delivery reporting', 'Export-ready views'],
    },
    {
        title: 'Security',
        points: ['Role-based access control', 'Least-privilege navigation', 'Clear audit-friendly flows'],
    },
];

const steps = [
    { k: '01', title: 'Sign in securely', text: 'Authenticate and land in a role-aware dashboard with the right modules and actions.' },
    { k: '02', title: 'Register & structure', text: 'Define types, models, attributes, and default compositions for consistent data entry.' },
    { k: '03', title: 'Operate daily', text: 'Manage movements, requests, maintenance steps, and approvals from a single workspace.' },
    { k: '04', title: 'Measure & improve', text: 'Use reports and histories to see trends, prevent downtime, and optimize costs.' },
];

const testimonials = [
    {
        name: 'Operations Team',
        role: 'Asset & stock coordination',
        quote: 'The workflow feels structured: types → models → instances, with the right approvals in the right places.',
    },
    {
        name: 'Maintenance Desk',
        role: 'Interventions & tracking',
        quote: 'Having steps, history, and timelines together reduces back-and-forth and helps us close work faster.',
    },
    {
        name: 'IT Bureau',
        role: 'Governance & reporting',
        quote: 'Role-based access keeps sensitive actions controlled while still making the UI fast to navigate.',
    },
];

const faqs = [
    {
        q: 'Who is the landing page for?',
        a: 'It is public-facing: it explains the system and provides a clear “Sign in” entry point. Authenticated users are redirected to the dashboard.',
    },
    {
        q: 'Does it support glassmorphism without images?',
        a: 'Yes. It uses layered translucency + blur + gradients (orbs) to create depth, without needing external images.',
    },
    {
        q: 'Can we customize sections later?',
        a: 'Yes. The page is built from small data arrays (capabilities, steps, testimonials, FAQs) so you can edit content quickly.',
    },
];

export default function LandingPage() {
    return (
        <div className="landing-page">
            <div className="landing-bg" aria-hidden="true" />

            <header className="landing-header">
                <div className="landing-brand">
                    <div className="landing-mark" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div className="landing-brand-text">
                        <div className="landing-brand-title">Equipment Management System</div>
                        <div className="landing-brand-subtitle">Secure, structured, and fast.</div>
                    </div>
                </div>

                <nav className="landing-actions">
                    <Link className="btn btn-secondary landing-btn" to="/login">
                        Sign in
                    </Link>
                </nav>
            </header>

            <main className="landing-main">
                <section className="landing-hero">
                    <div className="landing-hero-card landing-reveal" style={{ '--d': '40ms' }}>
                        <div className="landing-eyebrow">Control your fleet, end-to-end</div>
                        <h1 className="landing-title">Glass-clear visibility over your equipment.</h1>
                        <p className="landing-subtitle">
                            Manage assets, movements, maintenance, and inventories with a modern interface built for operational teams — designed for
                            clarity, traceability, and speed.
                        </p>

                        <div className="landing-cta">
                            <Link className="btn btn-primary landing-btn" to="/login">
                                Get started
                            </Link>
                            <a className="btn btn-secondary landing-btn" href="#features">
                                Explore features
                            </a>
                        </div>

                        <div className="landing-metrics">
                            <div className="landing-metric">
                                <div className="landing-metric-value">RBAC</div>
                                <div className="landing-metric-label">Role-based access</div>
                            </div>
                            <div className="landing-metric">
                                <div className="landing-metric-value">Traceability</div>
                                <div className="landing-metric-label">Movements & history</div>
                            </div>
                            <div className="landing-metric">
                                <div className="landing-metric-value">Speed</div>
                                <div className="landing-metric-label">Focused workflows</div>
                            </div>
                        </div>
                    </div>

                    <div className="landing-hero-side" aria-hidden="true">
                        <div className="landing-orb landing-orb-1" />
                        <div className="landing-orb landing-orb-2" />
                        <div className="landing-orb landing-orb-3" />
                        <div className="landing-glass-panel landing-reveal" style={{ '--d': '120ms' }}>
                            <div className="landing-glass-panel-head">
                                <div className="landing-glass-panel-title">At a glance</div>
                                <div className="landing-glass-panel-subtitle">Today’s workspace</div>
                            </div>

                            <div className="landing-glass-kpis">
                                <div className="landing-glass-kpi">
                                    <div className="landing-glass-kpi-label">Approvals</div>
                                    <div className="landing-glass-kpi-value">Inbox</div>
                                </div>
                                <div className="landing-glass-kpi">
                                    <div className="landing-glass-kpi-label">Inventory</div>
                                    <div className="landing-glass-kpi-value">Tracked</div>
                                </div>
                                <div className="landing-glass-kpi">
                                    <div className="landing-glass-kpi-label">Maintenance</div>
                                    <div className="landing-glass-kpi-value">Timeline</div>
                                </div>
                            </div>

                            <div className="landing-glass-shortcuts">
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">Assets</div>
                                    <div className="landing-glass-shortcut-text">Types • Models • Instances</div>
                                </div>
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">Stock</div>
                                    <div className="landing-glass-shortcut-text">Locations • Compatibility</div>
                                </div>
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">Reports</div>
                                    <div className="landing-glass-shortcut-text">Incidents • Backorders</div>
                                </div>
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">Requests</div>
                                    <div className="landing-glass-shortcut-text">Inbox • Approvals</div>
                                </div>
                            </div>

                            <div className="landing-glass-status">
                                <span className="landing-pill landing-pill-strong">Role-aware navigation</span>
                                <span className="landing-pill">Audit-friendly flows</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="landing-features">
                    <div className="landing-section-head">
                        <h2 className="landing-section-title">Built for everyday operations</h2>
                        <p className="landing-section-subtitle">Everything you need to manage equipment workflows without friction.</p>
                    </div>

                    <div className="landing-feature-grid">
                        {highlights.map((h, idx) => (
                            <div
                                key={h.title}
                                className="landing-feature-card landing-reveal"
                                style={{ '--d': `${160 + idx * 70}ms` }}
                            >
                                <div className="landing-feature-icon" aria-hidden="true">
                                    {h.icon}
                                </div>
                                <div className="landing-feature-title">{h.title}</div>
                                <div className="landing-feature-text">{h.description}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="landing-split landing-section">
                    <div className="landing-split-left">
                        <div className="landing-section-kicker">Coverage</div>
                        <h2 className="landing-section-title">A complete module set, organized the right way</h2>
                        <p className="landing-section-subtitle">
                            Your app already includes rich modules across assets, maintenance, stock/consumables, organizational structure, purchasing,
                            and approvals. This landing page highlights those capabilities clearly.
                        </p>

                        <div className="landing-capability-grid">
                            {capabilityGroups.map((g, idx) => (
                                <div
                                    key={g.title}
                                    className="landing-capability-card landing-reveal"
                                    style={{ '--d': `${120 + idx * 60}ms` }}
                                >
                                    <div className="landing-capability-title">{g.title}</div>
                                    <ul className="landing-capability-list">
                                        {g.points.map((p) => (
                                            <li key={p} className="landing-capability-item">
                                                <span className="landing-dot" aria-hidden="true" />
                                                <span>{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="landing-split-right" aria-hidden="true">
                        <div className="landing-mock landing-reveal" style={{ '--d': '200ms' }}>
                            <div className="landing-mock-top">
                                <span className="landing-window-dot landing-window-dot-red" />
                                <span className="landing-window-dot landing-window-dot-yellow" />
                                <span className="landing-window-dot landing-window-dot-green" />
                                <span className="landing-mock-title">Dashboard preview</span>
                            </div>
                            <div className="landing-mock-body">
                                <div className="landing-mini-grid">
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">Assets</div>
                                        <div className="landing-mini-value">Types → Models → Instances</div>
                                    </div>
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">Maintenance</div>
                                        <div className="landing-mini-value">Steps • Timeline • History</div>
                                    </div>
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">Approvals</div>
                                        <div className="landing-mini-value">Inbox + movement validation</div>
                                    </div>
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">Stock</div>
                                        <div className="landing-mini-value">Inventory by location</div>
                                    </div>
                                </div>

                                <div className="landing-mini-table">
                                    <div className="landing-mini-row landing-mini-row-head">
                                        <span>Recent activity</span>
                                        <span>Status</span>
                                    </div>
                                    <div className="landing-mini-row">
                                        <span>Asset movement approval</span>
                                        <span className="landing-mini-badge">Pending</span>
                                    </div>
                                    <div className="landing-mini-row">
                                        <span>Maintenance step completed</span>
                                        <span className="landing-mini-badge ok">Done</span>
                                    </div>
                                    <div className="landing-mini-row">
                                        <span>Purchase order received</span>
                                        <span className="landing-mini-badge info">Updated</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section">
                    <div className="landing-section-head">
                        <div className="landing-section-kicker">Workflow</div>
                        <h2 className="landing-section-title">From registration to reporting, in four steps</h2>
                        <p className="landing-section-subtitle">
                            A clear operational loop that fits how equipment teams actually work, with minimal clicks and maximum traceability.
                        </p>
                    </div>

                    <div className="landing-steps">
                        {steps.map((s, idx) => (
                            <div key={s.k} className="landing-step landing-reveal" style={{ '--d': `${120 + idx * 80}ms` }}>
                                <div className="landing-step-k">{s.k}</div>
                                <div className="landing-step-title">{s.title}</div>
                                <div className="landing-step-text">{s.text}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="landing-section">
                    <div className="landing-section-head">
                        <div className="landing-section-kicker">Social proof</div>
                        <h2 className="landing-section-title">Designed for real teams</h2>
                        <p className="landing-section-subtitle">A glass UI is nice — but clarity and structure are what make the system usable daily.</p>
                    </div>

                    <div className="landing-testimonials">
                        {testimonials.map((t, idx) => (
                            <figure key={t.name} className="landing-quote landing-reveal" style={{ '--d': `${120 + idx * 80}ms` }}>
                                <blockquote className="landing-quote-text">“{t.quote}”</blockquote>
                                <figcaption className="landing-quote-meta">
                                    <span className="landing-quote-name">{t.name}</span>
                                    <span className="landing-quote-role">{t.role}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                <section className="landing-section">
                    <div className="landing-section-head">
                        <div className="landing-section-kicker">FAQ</div>
                        <h2 className="landing-section-title">Common questions</h2>
                        <p className="landing-section-subtitle">Quick answers about the landing page and how it fits your app.</p>
                    </div>

                    <div className="landing-faq">
                        {faqs.map((f, idx) => (
                            <details key={f.q} className="landing-faq-item landing-reveal" style={{ '--d': `${120 + idx * 80}ms` }}>
                                <summary className="landing-faq-q">{f.q}</summary>
                                <div className="landing-faq-a">{f.a}</div>
                            </details>
                        ))}
                    </div>
                </section>

                <section className="landing-cta-band landing-reveal" style={{ '--d': '140ms' }}>
                    <div className="landing-cta-band-inner">
                        <div className="landing-cta-band-title">Ready to manage equipment with clarity?</div>
                        <div className="landing-cta-band-text">Sign in and jump straight into your role-based dashboard.</div>
                    </div>
                    <div className="landing-cta-band-actions">
                        <Link className="btn btn-primary landing-btn" to="/login">
                            Sign in
                        </Link>
                        <a className="btn btn-secondary landing-btn" href="#features">
                            Review features
                        </a>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-footer-left">
                        <span className="landing-footer-muted">© {new Date().getFullYear()} EMS</span>
                        <span className="landing-footer-muted">Modern glassmorphism UI • Dark theme</span>
                    </div>
                    <div className="landing-footer-right">
                        <a className="landing-footer-link" href="#features">
                            Features
                        </a>
                        <Link className="landing-footer-link" to="/login">
                            Sign in
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

