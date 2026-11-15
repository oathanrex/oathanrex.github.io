import { FALLBACK_PROFILE, FALLBACK_REPOS } from '../data/portfolioData';
import type { GitHubProfile, GitHubRepo } from '../types/portfolio';

const CACHE_KEY = 'oathanrex-github-portfolio-v1';
const CACHE_TTL_MS = 1000 * 60 * 30;
const USERNAME = 'oathanrex';

interface CachedPortfolioPayload {
  timestamp: number;
  profile: GitHubProfile;
  repos: GitHubRepo[];
}

function readCache(): CachedPortfolioPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPortfolioPayload;
    if (!parsed?.profile || !Array.isArray(parsed?.repos) || parsed.repos.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(payload: CachedPortfolioPayload): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or private mode failures
  }
}

async function fetchLivePortfolio(): Promise<{
  profile: GitHubProfile;
  repos: GitHubRepo[];
} | null> {
  if (typeof fetch !== 'function') return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal,
      }),
      fetch(
        `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`,
        {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal,
        }
      ),
    ]);

    clearTimeout(timer);

    if (!profileRes.ok || !reposRes.ok) return null;

    const profile = (await profileRes.json()) as GitHubProfile;
    const repos = (await reposRes.json()) as GitHubRepo[];

    if (!profile?.login || !Array.isArray(repos) || repos.length === 0) {
      return null;
    }

    const payload: CachedPortfolioPayload = {
      timestamp: Date.now(),
      profile,
      repos,
    };
    writeCache(payload);
    return { profile, repos };
  } catch {
    return null;
  }
}

export async function loadGitHubPortfolio(
  onFresh?: (next: { profile: GitHubProfile; repos: GitHubRepo[] }) => void
): Promise<{ profile: GitHubProfile; repos: GitHubRepo[] }> {
  const cached = readCache();
  if (cached) {
    const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
    if (!isFresh && onFresh) {
      fetchLivePortfolio().then((live) => {
        if (live) onFresh(live);
      });
    }
    return { profile: cached.profile, repos: cached.repos };
  }

  const live = await fetchLivePortfolio();
  if (live) return live;

  return {
    profile: FALLBACK_PROFILE,
    repos: FALLBACK_REPOS,
  };
}

export async function loadRepoReadme(
  repoName: string,
  owner = USERNAME,
  fallback?: string
): Promise<string> {
  if (typeof fetch !== 'function') {
    return fallback || `# ${repoName}\n\nRepository hosted on GitHub under @${owner}.`;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/readme`,
      {
        headers: { Accept: 'application/vnd.github.raw+json' },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (res.ok) {
      const text = await res.text();
      if (text.trim()) return text;
    }
  } catch {
    // Fallback below
  }

  return (
    fallback ||
    `# ${repoName}\n\nOpen-source repository maintained by @${owner}.\n\nView full source and documentation directly on GitHub.`
  );
}
