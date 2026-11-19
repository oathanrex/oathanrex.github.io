import { Keyboard, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { triggerThemeWave } from '../utils/distortionTransition';

interface NavbarProps {
  onOpenProjectBrief: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  onOpenCommandPalette: () => void;
}

const NAV_ITEMS = [
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'capabilities', label: 'Capabilities', href: '#capabilities' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export function Navbar({
  onOpenProjectBrief,
  theme,
  onToggleTheme,
  onOpenShortcuts,
  onOpenCommandPalette,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('work');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 32,
    restDelta: 0.001,
  });

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-32% 0px -55% 0px',
        threshold: 0,
      }
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--brand-border)] bg-[var(--brand-bg)]/88 backdrop-blur-xl transition-colors duration-200">
      <motion.div
        aria-hidden="true"
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="pointer-events-none absolute top-0 right-0 left-0 h-[2px] bg-[var(--brand-accent)]"
      />
      <div className="layout-container flex h-16 items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Official OathanRex Logo + single-line wordmark */}
        <a
          href="#top"
          className="focus-ring group inline-flex items-center gap-2.5 font-display text-base sm:text-lg font-bold tracking-tight text-[var(--brand-fg)] whitespace-nowrap shrink-0"
        >
          <BrandLogo
            size={34}
            shape="circle"
            className="transition-transform duration-150 group-hover:scale-105"
          />
          <span>Oathan Rex</span>
        </a>

        {/* Zone 2: Semantic menu list with live IntersectionObserver scroll-spy */}
        <nav aria-label="Primary" className="hidden md:block">
          <menu className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? 'location' : undefined}
                    className={`focus-ring relative inline-flex py-1.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-[var(--brand-fg)]'
                        : 'text-[var(--brand-muted)] hover:text-[var(--brand-fg)]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-underline"
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 -bottom-0.5 left-0 h-[2px] rounded-full bg-[var(--brand-accent)]"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </menu>
        </nav>

        {/* Zone 3: Command Trigger + Shortcuts + Theme Toggle + Primary CTA + Mobile Triggers */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Desktop Command Palette Pill */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
            title="Command Palette (Ctrl K)"
            className="btn-secondary hidden lg:inline-flex items-center gap-2.5 h-9 px-3.5 text-xs font-medium text-[var(--brand-muted)] hover:text-[var(--brand-fg)] hover:border-[var(--brand-accent)]/50 transition-all rounded-full"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-sans">Search</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--brand-well)] text-[var(--brand-fg)] border border-[var(--brand-border)]">
              Ctrl K
            </kbd>
          </button>

          {/* Mobile Quick Search Icon Button (opens Command Palette directly) */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Search and command palette"
            title="Search (Ctrl K)"
            className="btn-icon h-9 w-9 text-[var(--brand-muted)] hover:text-[var(--brand-fg)] lg:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            aria-label="Open keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            className="btn-icon hidden sm:inline-flex h-9 w-9 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
          >
            <Keyboard className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Theme Toggle Pill with Distortion Wave (Save/Saved effect) */}
          <button
            type="button"
            id="themeToggleBtn"
            onClick={(e) => {
              triggerThemeWave(e.currentTarget, onToggleTheme, e);
            }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Toggle theme (T) · Currently ${theme === 'dark' ? 'Dark' : 'Light'}`}
            className="btn-icon h-9 w-9 text-[var(--brand-muted)] hover:text-[var(--brand-fg)] relative"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {/* Collaborate Action */}
          <button
            type="button"
            onClick={onOpenProjectBrief}
            className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex"
          >
            Collaborate
          </button>

          {/* Mobile Drawer Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="btn-icon h-9 w-9 md:hidden"
          >
            {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Refined Mobile Navigation Sheet / Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile Navigation"
          className="border-t border-[var(--brand-border)] bg-[var(--brand-surface)]/98 backdrop-blur-2xl px-5 pt-4 pb-6 md:hidden shadow-xl"
        >
          {/* Quick Search Tap Strip */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenCommandPalette();
              }}
              className="flex w-full items-center justify-between rounded-full border border-[var(--brand-border)] bg-[var(--brand-well)] px-4 py-2.5 text-left text-sm text-[var(--brand-muted)] active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="h-4 w-4 text-[var(--brand-muted)] shrink-0" />
                <span className="truncate">Search projects, stack, tools...</span>
              </div>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-fg)] shrink-0">
                Ctrl K
              </kbd>
            </button>
          </div>

          <menu className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`focus-ring flex min-h-[46px] items-center justify-between rounded-xl px-4 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)]'
                        : 'text-[var(--brand-fg)] hover:bg-[var(--brand-well)] active:bg-[var(--brand-well)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[var(--brand-accent)]" />
                    )}
                  </a>
                </li>
              );
            })}

            {/* Mobile Utility Actions Bar */}
            <li className="pt-3 border-t border-[var(--brand-border-subtle)] mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenShortcuts();
                }}
                className="btn-secondary flex-1 min-h-[40px] px-3 text-xs gap-1.5"
              >
                <Keyboard className="h-3.5 w-3.5 text-[var(--brand-muted)]" />
                <span>Shortcuts (?)</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  triggerThemeWave(e.currentTarget, onToggleTheme, e);
                }}
                className="btn-secondary flex-1 min-h-[40px] px-3 text-xs gap-1.5"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </li>

            {/* Mobile Primary Action */}
            <li className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenProjectBrief();
                }}
                className="btn-primary flex min-h-[46px] w-full items-center justify-center px-4 py-2.5 text-sm font-semibold shadow-xs active:scale-[0.98] transition-transform"
              >
                Send Project Brief &amp; Collaborate
              </button>
            </li>
          </menu>
        </nav>
      )}
    </header>
  );
}
