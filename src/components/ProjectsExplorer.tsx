import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  GitFork,
  LayoutGrid,
  List,
  Search,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OATHANREX_CONTACT } from '../data/portfolioData';
import type {
  GitHubRepo,
  LanguageStat,
  PortfolioStats,
  RepoSortOption,
  ViewMode,
} from '../types/portfolio';
import {
  filterRepos,
  getLanguageColor,
  getRepoDemoUrl,
  isToolRepo,
  normalizeLangKey,
  selectTopStarredRepos,
  sortRepos,
} from '../utils/githubLogic';
import { triggerCategoryWave, triggerCopyWave } from '../utils/distortionTransition';

interface ProjectsExplorerProps {
  repos: GitHubRepo[];
  stats: PortfolioStats;
  languages: LanguageStat[];
  onOpenReadme: (repo: GitHubRepo) => void;
}

const REPOS_PER_PAGE = 9;

export function ProjectsExplorer({
  repos,
  stats,
  languages,
  onOpenReadme,
}: ProjectsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<RepoSortOption>('stars');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (key === 'g') {
        setViewMode('grid');
      } else if (key === 'l') {
        setViewMode('list');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const flagshipNames = useMemo(
    () => selectTopStarredRepos(repos, 4).map((r) => r.name),
    [repos]
  );

  const filterTabs = useMemo(() => {
    const langCounts: Record<string, number> = {};
    let starredCount = 0;
    let toolCount = 0;
    let demoCount = 0;
    let forkCount = 0;

    for (const repo of repos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
      if (repo.stargazers_count > 0) starredCount += 1;
      if (isToolRepo(repo)) toolCount += 1;
      if (repo.has_pages) demoCount += 1;
      if (repo.fork) forkCount += 1;
    }

    const topLangs = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({
        id: normalizeLangKey(lang),
        label: lang,
        count,
        color: getLanguageColor(lang),
      }));

    const catalogDefaultCount = Math.max(0, repos.length - flagshipNames.length);
    const tabs: { id: string; label: string; count: number; color?: string }[] = [
      { id: 'all', label: 'Catalog', count: catalogDefaultCount },
    ];

    if (starredCount > 0) tabs.push({ id: 'starred', label: 'Starred', count: starredCount });
    tabs.push(...topLangs);
    if (toolCount > 0) tabs.push({ id: 'tool', label: 'Tools', count: toolCount });
    if (demoCount > 0) tabs.push({ id: 'pages', label: 'Live Demos', count: demoCount });
    if (forkCount > 0) tabs.push({ id: 'forked', label: 'Forked', count: forkCount });

    return tabs;
  }, [repos, flagshipNames.length]);

  const excludeFlagships = categoryFilter === 'all' && !searchQuery.trim();

  const filteredRepos = useMemo(() => {
    const filtered = filterRepos(repos, {
      searchQuery,
      categoryFilter,
      excludePinned: excludeFlagships,
      pinnedNames: flagshipNames,
    }).filter(
      (r) => r.name !== 'perspective-fix' && r.name !== 'perspectivefix'
    );
    return sortRepos(filtered, sortBy);
  }, [repos, searchQuery, categoryFilter, sortBy, excludeFlagships, flagshipNames]);

  const displayedRepos = useMemo(
    () => filteredRepos.slice(0, page * REPOS_PER_PAGE),
    [filteredRepos, page]
  );

  const handleCopyClone = (repo: GitHubRepo, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      triggerCopyWave(e.currentTarget, () => {
        setCopiedId(repo.id);
      }, e);
    } else {
      setCopiedId(repo.id);
    }
    navigator.clipboard
      ?.writeText(repo.clone_url)
      .catch(() => {});
    setTimeout(() => setCopiedId(null), 1800);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSortBy('stars');
    setPage(1);
  };

  const renderRepoCard = (repo: GitHubRepo) => {
    const demoUrl = getRepoDemoUrl(repo, OATHANREX_CONTACT.handle.replace('@', ''));
    const langColor = getLanguageColor(repo.language);
    const isStarred = repo.stargazers_count > 0;
    const metaParts: string[] = [];
    if (repo.language) metaParts.push(repo.language);
    if (isToolRepo(repo)) metaParts.push('Tool');
    if (repo.fork) metaParts.push('Fork');
    if (repo.archived) metaParts.push('Archived');

    return (
      <article
        key={repo.id}
        data-testid="repo-card"
        data-starred={isStarred ? 'true' : 'false'}
        className={`surface-card flex flex-col justify-between p-5 transition-all duration-150 ${
          isStarred
            ? 'border-[var(--brand-amber)]/45 hover:border-[var(--brand-amber)] hover:shadow-xs'
            : 'hover:border-[var(--brand-accent)]/60 hover:shadow-xs'
        } ${viewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-6' : ''}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold text-[var(--brand-fg)]">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring underline-offset-4 hover:text-[var(--brand-accent-ink)] hover:underline"
              >
                {repo.name}
              </a>
            </h3>

            {isStarred && (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums text-[var(--brand-amber)] shrink-0">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                {repo.stargazers_count.toLocaleString()}
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--brand-muted)]">
            {repo.description || 'Repository documentation and source code.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--brand-muted)]">
            {repo.language && (
              <span className="inline-flex items-center gap-1.5 font-medium text-[var(--brand-fg)]">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: langColor }}
                  aria-hidden="true"
                />
                {repo.language}
              </span>
            )}
            {metaParts.slice(repo.language ? 1 : 0).map((part, idx) => (
              <span key={part} className="inline-flex items-center gap-2">
                {(repo.language || idx > 0) && <span aria-hidden="true">·</span>}
                <span>{part}</span>
              </span>
            ))}
            {!isStarred && (
              <>
                {(repo.language || metaParts.length > 0) && <span aria-hidden="true">·</span>}
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  {repo.stargazers_count.toLocaleString()}
                </span>
              </>
            )}
            {(repo.language || metaParts.length > 0 || !isStarred) && <span aria-hidden="true">·</span>}
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
              {repo.forks_count.toLocaleString()}
            </span>
          </div>
        </div>

        <div
          className={`mt-4 flex flex-wrap items-center gap-2 ${
            viewMode === 'list'
              ? 'sm:mt-0 sm:shrink-0'
              : 'border-t border-[var(--brand-border-subtle)] pt-3'
          }`}
        >
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary min-h-[36px] gap-1.5 px-3 py-1.5 text-xs font-medium"
          >
            Code
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>

          {repo.has_pages && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-h-[36px] gap-1.5 px-3 py-1.5 text-xs"
            >
              Demo
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onOpenReadme(repo)}
            aria-label={`Read README for ${repo.name}`}
            className="btn-secondary min-h-[36px] gap-1.5 px-3 py-1.5 text-xs font-medium"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            README
          </button>

          <button
            type="button"
            onClick={(e) => handleCopyClone(repo, e)}
            aria-label={`Copy clone URL for ${repo.name}`}
            className="btn-secondary min-h-[36px] gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--brand-muted)] hover:text-[var(--brand-fg)]"
          >
            {copiedId === repo.id ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--brand-accent-ink)]" aria-hidden="true" />
                Copied
              </>
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </article>
    );
  };

  return (
    <section id="projects" className="section-shell--well">
      <div className="layout-container">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow-label">Repository Explorer</p>
            <h2 className="section-heading">
              Search and filter all {stats.totalRepos} repositories
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--brand-muted)]">
            {excludeFlagships
              ? 'Showing the open-source catalog excluding the 4 flagships above. Search or switch tabs to include every repo.'
              : 'Filtering across every indexed GitHub repository.'}
          </p>
        </div>

        {languages.length > 0 && (
          <div id="github" className="surface-card mt-8 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-[var(--brand-fg)]">
                Primary Languages
              </h3>
              <span className="font-mono text-xs tabular-nums text-[var(--brand-muted)]">
                {repos.length} repositories indexed · {stats.totalForks} forks
              </span>
            </div>

            <div
              className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--brand-well)]"
              role="img"
              aria-label="Language distribution across indexed repositories"
            >
              {languages.map((item) => (
                <div
                  key={item.language}
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  title={`${item.language}: ${item.percent}%`}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              {languages.map((item) => (
                <div key={item.language} className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-[var(--brand-fg)]">{item.language}</span>
                  <span className="font-mono tabular-nums text-[var(--brand-muted)]">
                    {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]"
                aria-hidden="true"
              />
              <label htmlFor="project-search-input" className="sr-only">
                Search repositories
              </label>
              <input
                ref={searchInputRef}
                id="project-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search repositories by name, stack, or keyword (Press /)"
                className="form-field h-11 rounded-full pr-4 pl-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="project-sort-select" className="sr-only">
                Sort repositories
              </label>
              <select
                id="project-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as RepoSortOption)}
                className="form-field h-11 w-auto rounded-full px-4 text-sm font-medium hover:bg-[var(--brand-well)]"
              >
                <option value="stars">Most Stars</option>
                <option value="updated">Recently Updated</option>
                <option value="forks">Most Forks</option>
                <option value="name">Name (A-Z)</option>
                <option value="created">Recently Created</option>
              </select>

              <div className="surface-card inline-flex rounded-full p-1 border border-[var(--brand-border)]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[var(--brand-fg)] text-[var(--brand-bg)]'
                      : 'text-[var(--brand-muted)] hover:bg-[var(--brand-well)] hover:text-[var(--brand-fg)]'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[var(--brand-fg)] text-[var(--brand-bg)]'
                      : 'text-[var(--brand-muted)] hover:bg-[var(--brand-well)] hover:text-[var(--brand-fg)]'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex overflow-x-auto sm:flex-wrap items-center gap-2 pb-1.5 scroll-smooth [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
            role="tablist"
            aria-label="Filter repositories"
          >
            {filterTabs.map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={(e) => {
                    triggerCategoryWave(e.currentTarget, () => {
                      setCategoryFilter(tab.id);
                      setPage(1);
                    }, e);
                  }}
                  className={`focus-ring inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 hover:-translate-y-0.5 active:translate-y-0 ${
                    active
                      ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-[var(--brand-accent-fg)] hover:bg-[var(--brand-accent-hover)] shadow-xs'
                      : 'border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-muted)] hover:bg-[var(--brand-well)] hover:text-[var(--brand-fg)]'
                  }`}
                >
                  {tab.color && (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: active ? 'currentColor' : tab.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono tabular-nums ${
                      active ? 'bg-black/20 text-white dark:text-zinc-950 dark:bg-white/20' : 'bg-[var(--brand-well)] text-[var(--brand-muted)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between text-xs text-[var(--brand-muted)]">
            <span className="font-mono tabular-nums">
              Showing {displayedRepos.length} of {filteredRepos.length} repositories
            </span>
          </div>

          {displayedRepos.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <p className="font-display text-base font-semibold text-[var(--brand-fg)]">
                No repositories match your filter
              </p>
              <p className="mt-1 text-sm text-[var(--brand-muted)]">
                Try clearing the search query or switching to another category tab.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="focus-ring mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[var(--brand-fg)] px-4 py-2 text-xs font-semibold text-[var(--brand-bg)] transition-opacity hover:opacity-90"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'list'
                  ? 'flex flex-col gap-3'
                  : 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
              }
            >
              {displayedRepos.map((repo) => renderRepoCard(repo))}
            </div>
          )}

          {filteredRepos.length > displayedRepos.length && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary min-h-[44px] px-6 py-2.5 text-sm"
              >
                Load More ({filteredRepos.length - displayedRepos.length} remaining)
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.ceil(filteredRepos.length / REPOS_PER_PAGE))}
                className="btn-ghost min-h-[44px] px-4 py-2.5 text-sm"
              >
                Show All {filteredRepos.length}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
