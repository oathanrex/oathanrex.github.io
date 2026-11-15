import { ArrowUp, Keyboard } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface FooterProps {
  onOpenShortcuts: () => void;
}

const FOOTER_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Projects', href: '#projects' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Contact', href: '#contact' },
] as const;

export function Footer({ onOpenShortcuts }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-shell">
      <div
        aria-hidden="true"
        className="drafting-grid pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="layout-container relative z-10 py-10 lg:py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <a
              href="#top"
              className="focus-ring inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[var(--brand-fg)]"
            >
              <BrandLogo size={32} />
              <span>Oathan Rex</span>
            </a>
            <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-[var(--brand-muted)]">
              Privacy-first browser software,{' '}
              <abbr
                title="Oklab Lightness Chroma Hue"
                className="no-underline font-medium text-[var(--brand-fg)]"
              >
                OKLCH
              </abbr>{' '}
              design tooling, and open-source developer utilities.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <menu className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[var(--brand-muted)]">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="focus-ring inline-block py-1 underline-offset-4 transition-colors hover:text-[var(--brand-fg)] hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </menu>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="btn-secondary min-h-[38px] gap-1.5 px-3.5 py-2 text-xs"
            >
              <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
              Shortcuts
            </button>

            <button
              type="button"
              onClick={scrollToTop}
              className="btn-secondary min-h-[38px] gap-1.5 px-3.5 py-2 text-xs"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              Back to top
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-[var(--brand-border)] pt-6 text-xs text-[var(--brand-muted)] sm:flex-row sm:items-center">
          <p>
            &copy; <time dateTime="2026">2026</time> Oathan Rex. All rights reserved.
          </p>
          <p className="font-mono">oathanrex.github.io</p>
        </div>
      </div>
    </footer>
  );
}
