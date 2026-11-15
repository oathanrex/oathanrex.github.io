import type {
  CaseStudy,
  FlagshipShowcaseItem,
  GitHubProfile,
  GitHubRepo,
  LanguageStat,
  MarkdownBlock,
  PortfolioStats,
  ProjectBriefInput,
  RepoSortOption,
} from '../types/portfolio';

const TOOL_KEYWORDS = [
  'tool',
  'utility',
  'converter',
  'editor',
  'generator',
  'formatter',
  'checker',
  'scanner',
  'finder',
  'cleaner',
  'toolkit',
  'ocr',
  'writer',
  'linter',
];

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#663399',
  Python: '#3572a5',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  Java: '#b07219',
  'C#': '#178600',
};

export function normalizeLangKey(lang: string): string {
  return `lang:${lang.toLowerCase()}`;
}

export function getLanguageColor(language: string | null | undefined): string {
  if (!language) return '#94a3b8';
  return LANGUAGE_COLORS[language] || '#64748b';
}

export function isToolRepo(repo: Pick<GitHubRepo, 'name' | 'description' | 'topics'>): boolean {
  const haystack = [
    repo.name,
    repo.description || '',
    ...(repo.topics || []),
  ]
    .join(' ')
    .toLowerCase();

  return TOOL_KEYWORDS.some((kw) => haystack.includes(kw));
}

export function isPinnedRepo(name: string, pinnedNames: string[]): boolean {
  const target = name.trim().toLowerCase();
  return pinnedNames.some((pin) => pin.trim().toLowerCase() === target);
}

export function getRepoDemoUrl(
  repo: Pick<GitHubRepo, 'name' | 'homepage' | 'html_url'>,
  username = 'oathanrex'
): string {
  if (repo.homepage && /^https?:\/\//i.test(repo.homepage)) {
    return repo.homepage;
  }
  const cleanUser = username.toLowerCase();
  if (repo.name.toLowerCase() === `${cleanUser}.github.io`) {
    return `https://${cleanUser}.github.io/`;
  }
  return `https://${cleanUser}.github.io/${encodeURIComponent(repo.name)}/`;
}

export function selectTopStarredRepos(repos: GitHubRepo[], count = 4): GitHubRepo[] {
  return repos
    .filter((r) => !r.fork && !r.archived)
    .slice()
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        b.forks_count - a.forks_count ||
        a.name.localeCompare(b.name)
    )
    .slice(0, count);
}

export function selectPinnedRepos(
  repos: GitHubRepo[],
  explicitNames: string[],
  targetCount = 4
): GitHubRepo[] {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
  const selected: GitHubRepo[] = [];
  const seen = new Set<string>();

  for (const name of explicitNames) {
    const match = byName.get(name.toLowerCase());
    if (match && !seen.has(match.name.toLowerCase())) {
      selected.push(match);
      seen.add(match.name.toLowerCase());
    }
  }

  if (selected.length < targetCount) {
    const remaining = repos
      .filter((r) => !r.fork && !r.archived && !seen.has(r.name.toLowerCase()))
      .slice()
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          b.forks_count - a.forks_count
      );

    for (const repo of remaining) {
      if (selected.length >= targetCount) break;
      selected.push(repo);
      seen.add(repo.name.toLowerCase());
    }
  }

  return selected.slice(0, targetCount);
}

export function filterRepos(
  repos: GitHubRepo[],
  options: {
    searchQuery?: string;
    categoryFilter?: string;
    excludePinned?: boolean;
    pinnedNames?: string[];
  }
): GitHubRepo[] {
  const q = (options.searchQuery || '').trim().toLowerCase();
  const category = options.categoryFilter || 'all';
  const pinnedNames = options.pinnedNames || [];

  return repos.filter((repo) => {
    if (options.excludePinned && isPinnedRepo(repo.name, pinnedNames)) {
      return false;
    }

    if (category === 'starred' && repo.stargazers_count <= 0) return false;
    if (category === 'tool' && !isToolRepo(repo)) return false;
    if (category === 'pages' && !repo.has_pages) return false;
    if (category === 'forked' && !repo.fork) return false;

    if (category.startsWith('lang:')) {
      const targetLang = category.slice(5);
      if (!repo.language || repo.language.toLowerCase() !== targetLang) {
        return false;
      }
    }

    if (q) {
      const searchable = [
        repo.name,
        repo.description || '',
        repo.language || '',
        ...(repo.topics || []),
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

export function sortRepos(repos: GitHubRepo[], sortBy: RepoSortOption): GitHubRepo[] {
  const list = repos.slice();
  switch (sortBy) {
    case 'updated':
      return list.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
    case 'created':
      return list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    case 'forks':
      return list.sort(
        (a, b) => b.forks_count - a.forks_count || b.stargazers_count - a.stargazers_count
      );
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'stars':
    default:
      return list.sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          b.forks_count - a.forks_count ||
          Date.parse(b.updated_at) - Date.parse(a.updated_at)
      );
  }
}

export function buildFlagshipShowcase(
  repos: GitHubRepo[],
  caseStudies: CaseStudy[],
  limit = 4
): FlagshipShowcaseItem[] {
  const repoMap = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
  const studyMap = new Map(caseStudies.map((c) => [c.repoName.toLowerCase(), c]));
  const topRepos = selectTopStarredRepos(repos, limit);

  const items: FlagshipShowcaseItem[] = [];
  const usedRepoNames = new Set<string>();

  for (const repo of topRepos) {
    const key = repo.name.toLowerCase();
    const matchedStudy = studyMap.get(key);
    usedRepoNames.add(key);

    if (matchedStudy) {
      items.push({
        study: matchedStudy,
        repo,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        rank: items.length + 1,
        hasLiveApp: matchedStudy.liveUrl !== matchedStudy.repoUrl,
      });
    } else {
      const liveUrl = repo.has_pages
        ? getRepoDemoUrl(repo, repo.owner?.login || 'oathanrex')
        : repo.html_url;

      items.push({
        study: {
          id: repo.name,
          repoName: repo.name,
          title: repo.name,
          category: repo.language || 'Open Source',
          year: new Date(repo.updated_at).getUTCFullYear().toString(),
          summary: repo.description || 'Open-source repository maintained by Oathan Rex.',
          impactMetric: `${repo.stargazers_count} Stars`,
          challenge:
            repo.description || 'Built as an open-source software module on GitHub.',
          architecture: 'Engineered with clean client-side and CLI primitives.',
          outcomes: [
            `Published openly on GitHub under @${repo.owner?.login || 'oathanrex'}`,
          ],
          stack: repo.language ? [repo.language] : ['Open Source'],
          repoUrl: repo.html_url,
          liveUrl,
        },
        repo,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        rank: items.length + 1,
        hasLiveApp: liveUrl !== repo.html_url,
      });
    }
  }

  for (const study of caseStudies) {
    if (items.length >= limit) break;
    const key = study.repoName.toLowerCase();
    if (usedRepoNames.has(key)) continue;
    const matchedRepo = repoMap.get(key);
    usedRepoNames.add(key);

    items.push({
      study,
      repo: matchedRepo,
      stars: matchedRepo?.stargazers_count ?? 0,
      forks: matchedRepo?.forks_count ?? 0,
      rank: items.length + 1,
      hasLiveApp: study.liveUrl !== study.repoUrl,
    });
  }

  return items.slice(0, limit);
}

export function computeLanguageDistribution(
  repos: GitHubRepo[],
  limit = 6
): LanguageStat[] {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const repo of repos) {
    if (!repo.language) continue;
    counts[repo.language] = (counts[repo.language] || 0) + 1;
    total += 1;
  }

  if (total === 0) return [];

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([language, count]) => ({
      language,
      count,
      percent: Math.round((count / total) * 100),
      color: getLanguageColor(language),
    }));
}

export function computePortfolioStats(
  repos: GitHubRepo[],
  profile: GitHubProfile
): PortfolioStats {
  const totalDemos = repos.filter((r) => r.has_pages).length;
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const totalStarredRepos = repos.filter((r) => (r.stargazers_count || 0) > 0).length;

  return {
    totalRepos: Math.max(repos.length, profile.public_repos || 0),
    totalDemos,
    totalStars,
    totalForks,
    totalStarredRepos,
  };
}

export function parseSimpleMarkdown(markdown: string): MarkdownBlock[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ').trim() });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim().startsWith('```')) {
      flushParagraph();
      flushList();
      if (inCode) {
        blocks.push({ type: 'code', content: codeLines.join('\n') });
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    const listMatch = /^[-*+]\s+(.+)$/.exec(line.trim());
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(line.trim());
  }

  if (inCode && codeLines.length > 0) {
    blocks.push({ type: 'code', content: codeLines.join('\n') });
  }
  flushParagraph();
  flushList();

  return blocks;
}

export function buildProjectBriefText(input: ProjectBriefInput): string {
  const lines = [
    `Scope: ${input.scope}`,
    `Timeline: ${input.timeline}`,
  ];

  if (input.activeStage) {
    lines.push(`Current Stage: ${input.activeStage}`);
  }
  if (input.activeTimeline) {
    lines.push(`Active Project Target: ${input.activeTimeline}`);
  }
  if (input.senderEmail && input.senderEmail.trim()) {
    lines.push(`Reply-To: ${input.senderEmail.trim()}`);
  }
  if (input.notes && input.notes.trim()) {
    lines.push('', 'Notes:', input.notes.trim());
  }

  return lines.join('\n');
}

export function buildProjectBriefMailto(input: ProjectBriefInput): string {
  const subject = `[Project Brief] ${input.scope}`;
  const body = buildProjectBriefText(input);
  return `mailto:oathanrex@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
