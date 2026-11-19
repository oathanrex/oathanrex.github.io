import { Menu, Moon, Sun, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { BrandLogo } from '../ui/BrandLogo';

interface NavbarProps {
  onOpenProjectBrief: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS = [
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'capabilities', label: 'Capabilities', href: '#capabilities' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export function Navbar({ onOpenProjectBrief, theme, onToggleTheme }: NavbarProps) {
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
    <header className="sticky top-0 z-40 border-b border-[var(--brand-border)] bg-[var(--brand-bg)]/92 backdrop-blur-md">
      <motion.div
        aria-hidden="true"
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="pointer-events-none absolute top-0 right-0 left-0 h-[2px] bg-[var(--brand-accent)]"
      />
      <div className="layout-container flex h-16 items-center justify-between gap-8">
        {/* Zone 1: Official OathanRex Logo + single-line wordmark */}
        <a
          href="#top"
          className="focus-ring group inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[var(--brand-fg)] whitespace-nowrap shrink-0"
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

        {/* Zone 3: Theme Toggle Pill + Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Toggle theme (T) · Currently ${theme === 'dark' ? 'Dark' : 'Light'}`}
            className="btn-icon h-10 w-10 text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenProjectBrief}
            className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex"
          >
            Collaborate
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="btn-icon h-10 w-10 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile Navigation"
          className="border-t border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-4 md:hidden"
        >
          <menu className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`focus-ring flex min-h-[44px] items-center justify-between rounded-lg px-3 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent-ink)] font-semibold'
                        : 'text-[var(--brand-fg)] hover:bg-[var(--brand-well)]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
            <li className="pt-2 flex items-center justify-between border-t border-[var(--brand-border-subtle)] mt-1">
              <span className="text-sm font-medium text-[var(--brand-muted)]">Theme</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="btn-secondary h-9 px-3 text-xs gap-1.5"
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
            <li className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenProjectBrief();
                }}
                className="btn-primary flex min-h-[44px] w-full px-4 py-2.5 text-sm"
              >
                Collaborate
              </button>
            </li>
          </menu>
        </nav>
      )}
    </header>
  );
}
