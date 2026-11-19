import { ArrowDown, ArrowUpRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { lazy, Suspense } from 'react';
import { OATHANREX_CONTACT } from '../data/portfolioData';
import type { GitHubProfile, PortfolioStats } from '../types/portfolio';
import { BrandLogo } from '../ui/BrandLogo';

const HeroParticleCanvas = lazy(() =>
  import('./HeroParticleCanvas').then((m) => ({ default: m.HeroParticleCanvas }))
);

const HERO_EASE = [0.22, 1, 0.36, 1] as const;

interface HeroProps {
  profile: GitHubProfile;
  stats: PortfolioStats;
  theme: 'light' | 'dark';
}

export function Hero({
  profile,
  stats,
  theme,
}: HeroProps) {
  const proofMetrics = [
    {
      value: `${stats.totalRepos}`,
      label: 'Public Repositories',
      detail: 'Open-source on GitHub',
    },
    {
      value: `${stats.totalDemos}`,
      label: 'Live Browser Apps',
      detail: 'Zero-install GitHub Pages',
    },
    {
      value: `${stats.totalStars}`,
      label: 'GitHub Stars',
      detail: `${stats.totalStarredRepos} starred repositories`,
    },
    {
      value: '0',
      label: 'Server Uploads',
      detail: '100% local browser privacy',
    },
  ];

  return (
    <section id="top" className="section-shell--hero">
      {/* Lazy-Loaded Low-Poly Interactive Three.js Particle Field */}
      <Suspense fallback={null}>
        <HeroParticleCanvas theme={theme} />
      </Suspense>

      {/* Measured Readability Gradient Scrim over Typography Zone (extra coverage on mobile) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[var(--brand-bg)]/70 sm:bg-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, var(--brand-bg) 0%, color-mix(in oklab, var(--brand-bg) 88%, transparent) 55%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style={{
          background:
            'linear-gradient(0deg, var(--brand-bg) 0%, color-mix(in oklab, var(--brand-bg) 70%, transparent) 55%, transparent 100%)',
        }}
      />

      <div className="layout-container relative z-10 pt-10 pb-12 lg:pt-16 lg:pb-14">
        <motion.div
          initial={{ opacity: 1, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: HERO_EASE }}
          className="max-w-3xl"
        >
          {/* Identity & Status Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <BrandLogo size={48} shape="circle" className="shadow-xs ring-2 ring-[var(--brand-border)]" />

              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-[var(--brand-fg)]">
                  {profile.name || OATHANREX_CONTACT.name}{' '}
                  <span className="font-mono text-xs font-normal text-[var(--brand-muted)]">
                    ({OATHANREX_CONTACT.handle})
                  </span>
                </div>
                <a
                  href={OATHANREX_CONTACT.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-1 font-mono text-xs text-[var(--brand-accent-ink)] underline-offset-4 transition-colors hover:underline"
                >
                  github.com/{profile.login || 'oathanrex'}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--brand-muted)] shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Available for collaborations</span>
            </div>
          </div>

          <h1 className="mt-8 font-display text-[clamp(2.1rem,6.5vw,4.15rem)] font-bold leading-[1.06] tracking-[-0.03em] text-balance text-[var(--brand-fg)]">
            Browser software that stays on your device.
          </h1>

          <p className="mt-5 max-w-[58ch] text-sm leading-relaxed text-[var(--brand-muted)] sm:text-xl">
            Building fast, privacy-first web utilities, AI and OCR pipelines, and developer tools
            like PerspectiveFix and GitGet that run locally with zero uploads.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <a
              href="#projects"
              className="btn-primary min-h-[46px] px-6 py-2.5 text-sm shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Browse Projects
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href={OATHANREX_CONTACT.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary min-h-[46px] px-6 py-2.5 text-sm hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Launch PerspectiveFix
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        {/* Full-Width 4-Column Hairline Proof Strip */}
        <motion.div
          initial={{ opacity: 1, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04, ease: HERO_EASE }}
          className="mt-12 grid grid-cols-2 gap-y-5 divide-[var(--brand-border)] border-t border-[var(--brand-border)] pt-8 sm:grid-cols-4 sm:divide-x"
        >
          {proofMetrics.map((metric, idx) => (
            <div key={metric.label} className={idx > 0 ? 'sm:pl-6' : 'pr-4'}>
              <div className="font-display text-2xl font-bold tracking-tight tabular-nums text-[var(--brand-fg)] sm:text-3xl">
                <data value={metric.value}>{metric.value}</data>
              </div>
              <div className="mt-1 text-sm font-medium text-[var(--brand-fg)]">
                {metric.label}
              </div>
              <div className="mt-0.5 text-xs text-[var(--brand-muted)]">
                {metric.detail}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
