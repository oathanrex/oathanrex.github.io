import { ArrowUpRight, GitFork, Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { CASE_STUDIES } from '../data/portfolioData';
import type { CaseStudy, GitHubRepo } from '../types/portfolio';
import { buildFlagshipShowcase } from '../utils/githubLogic';

const WORK_EASE = [0.22, 1, 0.36, 1] as const;

interface SelectedWorkProps {
  repos: GitHubRepo[];
}

export function SelectedWork({ repos }: SelectedWorkProps) {
  const [activeStudy, setActiveStudy] = useState<CaseStudy | null>(null);

  useEffect(() => {
    if (!activeStudy) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveStudy(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeStudy]);

  const showcaseItems = useMemo(
    () => buildFlagshipShowcase(repos, CASE_STUDIES, 4),
    [repos]
  );

  return (
    <section id="work" className="section-shell">
      <div className="layout-container">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow-label">Top Starred Flagships</p>
            <h2 className="section-heading">Highest-rated software by stars</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--brand-muted)]">
            Ranked automatically from live GitHub stars. Launch any live web app directly or inspect
            its engineering architecture.
          </p>
        </div>

        {/* Dense 2x2 Editorial Product Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {showcaseItems.map(({ study, stars, forks, rank, hasLiveApp }) => {
            const displayHost = study.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
            return (
              <motion.article
                key={study.id}
                data-testid="flagship-card"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.16, ease: WORK_EASE }}
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
                }}
                className="surface-panel group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-150 hover:border-[var(--brand-accent)]/60 hover:shadow-xs"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, var(--brand-accent) 13%, transparent), transparent 65%)',
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--brand-muted)]">
                      <span className="font-mono font-semibold text-[var(--brand-fg)]">
                        #{rank}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{study.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[var(--brand-accent-ink)]">
                        {study.impactMetric}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 font-mono text-xs tabular-nums">
                      <span className="inline-flex items-center gap-1 font-semibold text-[var(--brand-amber)]">
                        <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        {stars}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[var(--brand-muted)]">
                        <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                        {forks}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-3.5 font-display text-xl font-bold tracking-tight text-[var(--brand-fg)]">
                    {study.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--brand-muted)]">
                    {study.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[var(--brand-muted)]">
                    <span>{study.stack.join(' · ')}</span>
                    {hasLiveApp && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate text-[var(--brand-fg)]">
                          {displayHost}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--brand-border-subtle)] pt-4">
                  <div className="flex items-center gap-2">
                    {hasLiveApp ? (
                      <>
                        <a
                          href={study.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary min-h-[38px] gap-1.5 px-3.5 py-1.5 text-xs"
                        >
                          Launch Live App
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                        {!study.hideSource && study.repoUrl && (
                          <a
                            href={study.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary min-h-[38px] gap-1.5 px-3.5 py-1.5 text-xs"
                          >
                            Source
                          </a>
                        )}
                      </>
                    ) : (
                      <a
                        href={study.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary min-h-[38px] gap-1.5 px-3.5 py-1.5 text-xs"
                      >
                        Explore Repository
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStudy(study)}
                    className="btn-ghost min-h-[38px] gap-1 px-2.5 py-1.5 text-xs font-semibold"
                  >
                    Architecture
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Case Study Deep-Dive Modal */}
      <AnimatePresence>
        {activeStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="modal-backdrop"
            onClick={() => setActiveStudy(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: WORK_EASE }}
              className="modal-panel max-h-[90vh] max-w-2xl overflow-y-auto p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[var(--brand-muted)]">
                    {activeStudy.category} <span aria-hidden="true">·</span>{' '}
                    <time dateTime={activeStudy.year}>{activeStudy.year}</time>{' '}
                    <span aria-hidden="true">·</span>{' '}
                    <span className="font-semibold text-[var(--brand-accent-ink)]">
                      {activeStudy.impactMetric}
                    </span>
                  </p>
                  <h3
                    id="case-study-modal-title"
                    className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--brand-fg)]"
                  >
                    {activeStudy.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStudy(null)}
                  aria-label="Close project details dialog"
                  className="btn-icon h-10 w-10 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-6 text-sm leading-relaxed text-[var(--brand-muted)]">
                <div>
                  <h4 className="font-semibold text-[var(--brand-fg)]">Why It Exists</h4>
                  <p className="mt-1.5">{activeStudy.challenge}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--brand-fg)]">Architecture</h4>
                  <p className="mt-1.5">{activeStudy.architecture}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--brand-fg)]">Key Capabilities</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5">
                    {activeStudy.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-[var(--brand-border)] pt-4">
                  <div className="text-xs text-[var(--brand-muted)]">
                    Stack:{' '}
                    <span className="font-medium text-[var(--brand-fg)]">
                      {activeStudy.stack.join(' · ')}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {activeStudy.liveUrl !== activeStudy.repoUrl && (
                      <a
                        href={activeStudy.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary min-h-[40px] gap-1.5 px-4 py-2 text-xs"
                      >
                        Launch Live App
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                    {!activeStudy.hideSource && activeStudy.repoUrl && (
                      <a
                        href={activeStudy.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary min-h-[40px] gap-1.5 px-4 py-2 text-xs"
                      >
                        View Source on GitHub
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
