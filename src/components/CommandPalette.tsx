import { ArrowRight, Mail, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OATHANREX_CONTACT } from '../data/portfolioData';
import type { GitHubRepo } from '../types/portfolio';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  repos: GitHubRepo[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenProjectBrief: () => void;
  onOpenReadme: (repo: GitHubRepo) => void;
}

export function CommandPalette({
  open,
  onClose,
  repos,
  theme,
  onToggleTheme,
  onOpenProjectBrief,
  onOpenReadme,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 20);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const matchingRepos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? repos.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q))
        )
      : repos;
    return [...list]
      .sort((a, b) => b.stargazers_count - a.stargazers_count || b.forks_count - a.forks_count)
      .slice(0, 6);
  }, [repos, query]);

  if (!open) return null;

  const jumpTo = (hash: string) => {
    onClose();
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="modal-backdrop items-start px-4 pt-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="modal-panel max-w-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--brand-border)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" />
          <label htmlFor="cmd-palette-input" className="sr-only">
            Type a command or search repositories
          </label>
          <input
            ref={inputRef}
            id="cmd-palette-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to section, search repositories, or run an action..."
            className="flex-1 bg-transparent text-sm text-[var(--brand-fg)] placeholder:text-[var(--brand-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-well)] hover:text-[var(--brand-fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 text-sm">
          <div className="px-2 py-1.5 text-xs font-semibold text-[var(--brand-muted)]">
            Quick Actions
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProjectBrief();
              }}
              className="focus-ring group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[var(--brand-fg)] transition-colors hover:bg-[var(--brand-well)]"
            >
              <span>Start a Project Brief</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--brand-muted)] transition-colors group-hover:text-[var(--brand-fg)]" />
            </button>

            <a
              href={`mailto:${OATHANREX_CONTACT.email}`}
              onClick={onClose}
              className="focus-ring group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[var(--brand-fg)] transition-colors hover:bg-[var(--brand-well)]"
            >
              <span>Email {OATHANREX_CONTACT.email}</span>
              <Mail className="h-3.5 w-3.5 text-[var(--brand-muted)] transition-colors group-hover:text-[var(--brand-fg)]" />
            </a>

            <button
              type="button"
              onClick={() => {
                onToggleTheme();
                onClose();
              }}
              className="focus-ring group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[var(--brand-fg)] transition-colors hover:bg-[var(--brand-well)]"
            >
              <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-[var(--brand-muted)] group-hover:text-[var(--brand-fg)]" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-[var(--brand-muted)] group-hover:text-[var(--brand-fg)]" />
              )}
            </button>
          </div>

          <div className="mt-3 px-2 py-1.5 text-xs font-semibold text-[var(--brand-muted)]">
            Navigate
          </div>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: 'Top Starred Work', href: '#work' },
              { label: 'GitHub Explorer', href: '#projects' },
              { label: 'DevTools Suite', href: '#tools' },
              { label: 'Capabilities', href: '#capabilities' },
              { label: 'Contact', href: '#contact' },
            ].map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => jumpTo(item.href)}
                className="focus-ring group flex items-center justify-between rounded-lg px-3 py-2 text-left text-[var(--brand-fg)] transition-colors hover:bg-[var(--brand-well)]"
              >
                <span>{item.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--brand-muted)] transition-colors group-hover:text-[var(--brand-fg)]" />
              </button>
            ))}
          </div>

          <div className="mt-3 px-2 py-1.5 text-xs font-semibold text-[var(--brand-muted)]">
            Repositories (Top Starred First · Inspect README)
          </div>
          <div className="space-y-1">
            {matchingRepos.map((repo) => (
              <button
                key={repo.id}
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReadme(repo);
                }}
                className="focus-ring flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[var(--brand-fg)] transition-colors hover:bg-[var(--brand-well)]"
              >
                <span className="truncate font-medium">{repo.name}</span>
                <span className="ml-3 shrink-0 font-mono text-xs text-[var(--brand-muted)]">
                  {repo.stargazers_count > 0 ? `★ ${repo.stargazers_count} · ` : ''}
                  {repo.language || 'Repo'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
