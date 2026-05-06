import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DarkVeil from '../components/DarkVeil';
import ThemeToggle from '../components/ThemeToggle';
import PowerSaveButton from '../components/PowerSaveButton';
import { useColorPalette } from '../context/useColorPalette';

export default function LandingPage() {
    const { t } = useTranslation();
    const { isRed, isOrange, isGreen } = useColorPalette();

    const highlights = [
        {
            title: t('landingPage.highlightsAssets'),
            description: t('landingPage.highlightsAssetsDesc'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            ),
        },
        {
            title: t('landingPage.highlightsMaintenance'),
            description: t('landingPage.highlightsMaintenanceDesc'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l8.2 8.2 5.4-5.4-8.2-8.2z" />
                    <path d="M8 8l-6 6v6h6l6-6" />
                </svg>
            ),
        },
        {
            title: t('landingPage.highlightsStock'),
            description: t('landingPage.highlightsStockDesc'),
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
            title: t('landingPage.assetLifecycle'),
            points: t('landingPage.assetLifecyclePoints').split('|'),
        },
        {
            title: t('landingPage.maintenanceOperations'),
            points: t('landingPage.maintenanceOperationsPoints').split('|'),
        },
        {
            title: t('landingPage.stockConsumables'),
            points: t('landingPage.stockConsumablesPoints').split('|'),
        },
        {
            title: t('landingPage.requestsApprovals'),
            points: t('landingPage.requestsApprovalsPoints').split('|'),
        },
        {
            title: t('landingPage.reporting'),
            points: t('landingPage.reportingPoints').split('|'),
        },
        {
            title: t('landingPage.security'),
            points: t('landingPage.securityPoints').split('|'),
        },
    ];

    const steps = [
        { k: '01', title: t('landingPage.step1Title'), text: t('landingPage.step1Text') },
        { k: '02', title: t('landingPage.step2Title'), text: t('landingPage.step2Text') },
        { k: '03', title: t('landingPage.step3Title'), text: t('landingPage.step3Text') },
        { k: '04', title: t('landingPage.step4Title'), text: t('landingPage.step4Text') },
    ];

    const testimonials = [
        {
            name: t('landingPage.operationsTeam'),
            role: t('landingPage.operationsRole'),
            quote: t('landingPage.operationsQuote'),
        },
        {
            name: t('landingPage.maintenanceDesk'),
            role: t('landingPage.maintenanceDeskRole'),
            quote: t('landingPage.maintenanceDeskQuote'),
        },
        {
            name: t('landingPage.itBureau'),
            role: t('landingPage.itBureauRole'),
            quote: t('landingPage.itBureauQuote'),
        },
    ];

    const faqs = [
        {
            q: t('landingPage.faq1Q'),
            a: t('landingPage.faq1A'),
        },
        {
            q: t('landingPage.faq2Q'),
            a: t('landingPage.faq2A'),
        },
        {
            q: t('landingPage.faq3Q'),
            a: t('landingPage.faq3A'),
        },
    ];
    return (
        <div className="landing-page">
            <div className="landing-bg" aria-hidden="true">
                <DarkVeil speed={0.3} hueShift={isRed ? -110 : isOrange ? -150 : isGreen ? 120 : 0} />
            </div>

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
                        <div className="landing-brand-title">{t('landingPage.brandTitle')}</div>
                        <div className="landing-brand-subtitle">{t('landingPage.brandSubtitle')}</div>
                    </div>
                </div>

                <nav className="landing-actions">
                    <ThemeToggle />
                    <PowerSaveButton />
                    <Link className="btn btn-secondary landing-btn" to="/login">
                        {t('landingPage.signIn')}
                    </Link>
                </nav>
            </header>

            <main className="landing-main">
                <section className="landing-hero">
                    <div className="landing-hero-card landing-reveal" style={{ '--d': '40ms' }}>
                        <div className="landing-eyebrow">{t('landingPage.eyebrow')}</div>
                        <h1 className="landing-title">{t('landingPage.heroTitle')}</h1>
                        <p className="landing-subtitle">
                            {t('landingPage.heroSubtitle')}
                        </p>

                        <div className="landing-cta">
                            <Link className="btn btn-primary landing-btn" to="/login">
                                {t('landingPage.getStarted')}
                            </Link>
                            <a className="btn btn-secondary landing-btn" href="#features">
                                {t('landingPage.exploreFeatures')}
                            </a>
                        </div>

                        <div className="landing-metrics">
                            <div className="landing-metric">
                                <div className="landing-metric-value">RBAC</div>
                                <div className="landing-metric-label">{t('landingPage.roleBasedAccess')}</div>
                            </div>
                            <div className="landing-metric">
                                <div className="landing-metric-value">Traceability</div>
                                <div className="landing-metric-label">{t('landingPage.movementsHistory')}</div>
                            </div>
                            <div className="landing-metric">
                                <div className="landing-metric-value">Speed</div>
                                <div className="landing-metric-label">{t('landingPage.focusedWorkflows')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="landing-hero-side" aria-hidden="true">
                        <div className="landing-orb landing-orb-1" />
                        <div className="landing-orb landing-orb-2" />
                        <div className="landing-orb landing-orb-3" />
                        <div className="landing-glass-panel landing-reveal" style={{ '--d': '120ms' }}>
                            <div className="landing-glass-panel-head">
                                <div className="landing-glass-panel-title">{t('landingPage.atAGlance')}</div>
                                <div className="landing-glass-panel-subtitle">{t('landingPage.todaysWorkspace')}</div>
                            </div>

                            <div className="landing-glass-kpis">
                                <div className="landing-glass-kpi">
                                    <div className="landing-glass-kpi-label">{t('landingPage.approvals')}</div>
                                    <div className="landing-glass-kpi-value">{t('landingPage.inbox')}</div>
                                </div>
                                <div className="landing-glass-kpi">
                                    <div className="landing-glass-kpi-label">{t('landingPage.inventory')}</div>
                                    <div className="landing-glass-kpi-value">{t('landingPage.tracked')}</div>
                                </div>
                                <div className="landing-glass-kpi">
                                    <div className="landing-glass-kpi-label">{t('landingPage.maintenance')}</div>
                                    <div className="landing-glass-kpi-value">{t('landingPage.timeline')}</div>
                                </div>
                            </div>

                            <div className="landing-glass-shortcuts">
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">{t('landingPage.assets')}</div>
                                    <div className="landing-glass-shortcut-text">{t('landingPage.typesModelsInstances')}</div>
                                </div>
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">{t('landingPage.stock')}</div>
                                    <div className="landing-glass-shortcut-text">{t('landingPage.locationsCompatibility')}</div>
                                </div>
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">{t('landingPage.reports')}</div>
                                    <div className="landing-glass-shortcut-text">{t('landingPage.incidentsBackorders')}</div>
                                </div>
                                <div className="landing-glass-shortcut">
                                    <div className="landing-glass-shortcut-title">{t('landingPage.requests')}</div>
                                    <div className="landing-glass-shortcut-text">{t('landingPage.inboxApprovals')}</div>
                                </div>
                            </div>

                            <div className="landing-glass-status">
                                <span className="landing-pill landing-pill-strong">{t('landingPage.roleAwareNavigation')}</span>
                                <span className="landing-pill">{t('landingPage.auditFriendlyFlows')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="landing-features">
                    <div className="landing-section-head">
                        <h2 className="landing-section-title">{t('landingPage.builtForOperations')}</h2>
                        <p className="landing-section-subtitle">{t('landingPage.operationsSubtitle')}</p>
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
                        <div className="landing-section-kicker">{t('landingPage.coverage')}</div>
                        <h2 className="landing-section-title">{t('landingPage.completeModulesTitle')}</h2>
                        <p className="landing-section-subtitle">
                            {t('landingPage.completeModulesSubtitle')}
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
                                <span className="landing-mock-title">{t('landingPage.dashboardPreview')}</span>
                            </div>
                            <div className="landing-mock-body">
                                <div className="landing-mini-grid">
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">{t('landingPage.assets')}</div>
                                        <div className="landing-mini-value">{t('landingPage.typesModelsInstances')}</div>
                                    </div>
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">{t('landingPage.maintenance')}</div>
                                        <div className="landing-mini-value">{t('landingPage.timeline')}</div>
                                    </div>
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">{t('landingPage.approvals')}</div>
                                        <div className="landing-mini-value">{t('landingPage.inboxApprovals')}</div>
                                    </div>
                                    <div className="landing-mini-card">
                                        <div className="landing-mini-label">{t('landingPage.stock')}</div>
                                        <div className="landing-mini-value">{t('landingPage.inventory')}</div>
                                    </div>
                                </div>

                                <div className="landing-mini-table">
                                    <div className="landing-mini-row landing-mini-row-head">
                                        <span>{t('landingPage.recentActivity')}</span>
                                        <span>{t('landingPage.status')}</span>
                                    </div>
                                    <div className="landing-mini-row">
                                        <span>{t('landingPage.assetMovementApproval')}</span>
                                        <span className="landing-mini-badge">{t('landingPage.pending')}</span>
                                    </div>
                                    <div className="landing-mini-row">
                                        <span>{t('landingPage.maintenanceStepCompleted')}</span>
                                        <span className="landing-mini-badge ok">{t('landingPage.done')}</span>
                                    </div>
                                    <div className="landing-mini-row">
                                        <span>{t('landingPage.purchaseOrderReceived')}</span>
                                        <span className="landing-mini-badge info">{t('landingPage.updated')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section">
                    <div className="landing-section-head">
                        <div className="landing-section-kicker">{t('landingPage.workflow')}</div>
                        <h2 className="landing-section-title">{t('landingPage.fourStepsTitle')}</h2>
                        <p className="landing-section-subtitle">
                            {t('landingPage.fourStepsSubtitle')}
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
                        <div className="landing-section-kicker">{t('landingPage.socialProof')}</div>
                        <h2 className="landing-section-title">{t('landingPage.designedForTeams')}</h2>
                        <p className="landing-section-subtitle">{t('landingPage.socialProofSubtitle')}</p>
                    </div>

                    <div className="landing-testimonials">
                        {testimonials.map((tm, idx) => (
                            <figure key={tm.name} className="landing-quote landing-reveal" style={{ '--d': `${120 + idx * 80}ms` }}>
                                <blockquote className="landing-quote-text">{tm.quote}</blockquote>
                                <figcaption className="landing-quote-meta">
                                    <span className="landing-quote-name">{tm.name}</span>
                                    <span className="landing-quote-role">{tm.role}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                <section className="landing-section">
                    <div className="landing-section-head">
                        <div className="landing-section-kicker">{t('landingPage.faq')}</div>
                        <h2 className="landing-section-title">{t('landingPage.commonQuestions')}</h2>
                        <p className="landing-section-subtitle">{t('landingPage.faqSubtitle')}</p>
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
                        <div className="landing-cta-band-title">{t('landingPage.readyTitle')}</div>
                        <div className="landing-cta-band-text">{t('landingPage.readyText')}</div>
                    </div>
                    <div className="landing-cta-band-actions">
                        <Link className="btn btn-primary landing-btn" to="/login">
                            {t('landingPage.signIn')}
                        </Link>
                        <a className="btn btn-secondary landing-btn" href="#features">
                            {t('landingPage.reviewFeatures')}
                        </a>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-footer-left">
                        <span className="landing-footer-muted">© {new Date().getFullYear()} EMS</span>
                        <span className="landing-footer-muted">{t('landingPage.footerText')}</span>
                    </div>
                    <div className="landing-footer-right">
                        <a className="landing-footer-link" href="#features">
                            {t('landingPage.features')}
                        </a>
                        <Link className="landing-footer-link" to="/login">
                            {t('landingPage.signIn')}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

