import { MotionConfig } from 'motion/react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from './components/Navbar';
import { FALLBACK_PROFILE, FALLBACK_REPOS } from './data/portfolioData';
import type { GitHubProfile, GitHubRepo } from './types/portfolio';
import { computeLanguageDistribution, computePortfolioStats } from './utils/githubLogic';
import { loadGitHubPortfolio } from './utils/githubService';

const Hero = lazy(() =>
  import('./components/Hero').then((m) => ({ default: m.Hero }))
);
const SelectedWork = lazy(() =>
  import('./components/SelectedWork').then((m) => ({ default: m.SelectedWork }))
);
const ProjectsExplorer = lazy(() =>
  import('./components/ProjectsExplorer').then((m) => ({ default: m.ProjectsExplorer }))
);
const CapabilitiesSection = lazy(() =>
  import('./components/CapabilitiesSection').then((m) => ({ default: m.CapabilitiesSection }))
);
const ContactSection = lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const Footer = lazy(() =>
  import('./components/Footer').then((m) => ({ default: m.Footer }))
);

const ProjectBriefModal = lazy(() =>
  import('./components/ProjectBriefModal').then((m) => ({ default: m.ProjectBriefModal }))
);
const CommandPalette = lazy(() =>
  import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);
const ReadmeModal = lazy(() =>
  import('./components/ReadmeModal').then((m) => ({ default: m.ReadmeModal }))
);
const ShortcutsModal = lazy(() =>
  import('./components/ShortcutsModal').then((m) => ({ default: m.ShortcutsModal }))
);

type ActiveModal =
  | { type: 'brief' }
  | { type: 'palette' }
  | { type: 'shortcuts' }
  | { type: 'readme'; repo: GitHubRepo }
  | null;

interface PortfolioDataState {
  profile: GitHubProfile;
  repos: GitHubRepo[];
}

function SectionReserve({
  id,
  className,
}: {
  id?: string;
  className: string;
}) {
  return <div id={id} aria-hidden="true" className={className} />;
}

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioDataState>({
    profile: FALLBACK_PROFILE,
    repos: FALLBACK_REPOS,
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('oathanrex-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('oathanrex-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    const applyUpdate = (next: { profile: GitHubProfile; repos: GitHubRepo[] }) => {
      if (!mounted) return;
      setPortfolio({ profile: next.profile, repos: next.repos });
    };

    loadGitHubPortfolio(applyUpdate).then(applyUpdate);

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const closeModal = useCallback(() => setActiveModal(null), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveModal((prev) => (prev?.type === 'palette' ? null : { type: 'palette' }));
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') target.blur();
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 't') {
        toggleTheme();
      } else if (key === '?') {
        setActiveModal((prev) => (prev?.type === 'shortcuts' ? null : { type: 'shortcuts' }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleTheme]);

  const stats = useMemo(
    () => computePortfolioStats(portfolio.repos, portfolio.profile),
    [portfolio.repos, portfolio.profile]
  );
  const languages = useMemo(
    () => computeLanguageDistribution(portfolio.repos, 6),
    [portfolio.repos]
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-fg)] transition-colors duration-150">
        <Navbar onOpenProjectBrief={() => setActiveModal({ type: 'brief' })} />

        <main>
          <Suspense
            fallback={<SectionReserve id="top" className="section-shell--hero min-h-[600px] sm:min-h-[540px]" />}
          >
            <Hero
              profile={portfolio.profile}
              stats={stats}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenShortcuts={() => setActiveModal({ type: 'shortcuts' })}
              onOpenCommandPalette={() => setActiveModal({ type: 'palette' })}
            />
          </Suspense>

          <Suspense
            fallback={<SectionReserve id="work" className="section-shell min-h-[660px]" />}
          >
            <SelectedWork repos={portfolio.repos} />
          </Suspense>

          <Suspense
            fallback={<SectionReserve id="projects" className="section-shell--well min-h-[1080px]" />}
          >
            <ProjectsExplorer
              repos={portfolio.repos}
              stats={stats}
              languages={languages}
              onOpenReadme={(repo) => setActiveModal({ type: 'readme', repo })}
            />
          </Suspense>

          <Suspense
            fallback={<SectionReserve id="capabilities" className="section-shell min-h-[560px]" />}
          >
            <CapabilitiesSection />
          </Suspense>

          <Suspense
            fallback={<SectionReserve id="contact" className="section-shell--end min-h-[420px]" />}
          >
            <ContactSection onOpenProjectBrief={() => setActiveModal({ type: 'brief' })} />
          </Suspense>
        </main>

        <Suspense
          fallback={<SectionReserve className="footer-shell min-h-[215px]" />}
        >
          <Footer onOpenShortcuts={() => setActiveModal({ type: 'shortcuts' })} />
        </Suspense>

        <Suspense fallback={null}>
          {activeModal?.type === 'brief' && (
            <ProjectBriefModal open onClose={closeModal} />
          )}

          {activeModal?.type === 'palette' && (
            <CommandPalette
              open
              onClose={closeModal}
              repos={portfolio.repos}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenProjectBrief={() => setActiveModal({ type: 'brief' })}
              onOpenReadme={(repo) => setActiveModal({ type: 'readme', repo })}
            />
          )}

          {activeModal?.type === 'readme' && (
            <ReadmeModal repo={activeModal.repo} onClose={closeModal} />
          )}

          {activeModal?.type === 'shortcuts' && (
            <ShortcutsModal open onClose={closeModal} />
          )}
        </Suspense>
      </div>
    </MotionConfig>
  );
}
