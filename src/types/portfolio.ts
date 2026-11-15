export interface GitHubProfile {
  login: string;
  name?: string | null;
  bio?: string | null;
  blog?: string | null;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
  email?: string | null;
  avatar_url?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  homepage?: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  has_pages: boolean;
  fork: boolean;
  archived: boolean;
  updated_at: string;
  created_at: string;
  owner?: { login: string };
  readmeFallback?: string;
}

export interface CaseStudy {
  id: string;
  repoName: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  impactMetric: string;
  challenge: string;
  architecture: string;
  outcomes: string[];
  stack: string[];
  repoUrl: string;
  liveUrl: string;
  hideSource?: boolean;
}

export interface CapabilityGroup {
  id: string;
  label: string;
  summary: string;
  items: { name: string; role: string }[];
}

export interface PortfolioStats {
  totalRepos: number;
  totalDemos: number;
  totalStars: number;
  totalForks: number;
  totalStarredRepos: number;
}

export interface LanguageStat {
  language: string;
  count: number;
  percent: number;
  color: string;
}

export type RepoSortOption = 'stars' | 'updated' | 'forks' | 'name' | 'created';
export type ViewMode = 'grid' | 'list';

export interface FlagshipShowcaseItem {
  study: CaseStudy;
  repo?: GitHubRepo;
  stars: number;
  forks: number;
  rank: number;
  hasLiveApp: boolean;
}

export type MarkdownBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'code'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string };

export interface ProjectBriefInput {
  scope: string;
  timeline: string;
  activeStage?: string;
  activeTimeline?: string;
  senderEmail?: string;
  notes?: string;
}
