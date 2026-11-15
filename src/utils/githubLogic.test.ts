import assert from 'node:assert/strict';
import test from 'node:test';
import { CASE_STUDIES, FALLBACK_PROFILE, FALLBACK_REPOS } from '../data/portfolioData.ts';
import {
  buildFlagshipShowcase,
  buildProjectBriefMailto,
  computeLanguageDistribution,
  computePortfolioStats,
  filterRepos,
  getRepoDemoUrl,
  isPinnedRepo,
  isToolRepo,
  normalizeLangKey,
  parseSimpleMarkdown,
  selectPinnedRepos,
  selectTopStarredRepos,
  sortRepos,
} from './githubLogic.ts';
import { formatVitalValue, rateVital } from './webVitals.ts';

test('isToolRepo detects tool keyword in description or topics', () => {
  assert.equal(
    isToolRepo({ name: 'sample', description: 'Offline Markdown utility', topics: [] }),
    true
  );
  assert.equal(
    isToolRepo({ name: 'notes', description: 'Personal diary', topics: ['cli-tool'] }),
    true
  );
  assert.equal(
    isToolRepo({ name: 'portfolio', description: 'Static showcase', topics: ['web'] }),
    false
  );
});

test('isPinnedRepo matches case-insensitively', () => {
  assert.equal(isPinnedRepo('Perspective-Fix', ['perspective-fix', 'gitget']), true);
  assert.equal(isPinnedRepo('unknown-repo', ['perspective-fix']), false);
});

test('getRepoDemoUrl formats root pages and project pages accurately', () => {
  assert.equal(
    getRepoDemoUrl(
      { name: 'oathanrex.github.io', homepage: null, html_url: 'https://github.com/oathanrex/oathanrex.github.io' },
      'oathanrex'
    ),
    'https://oathanrex.github.io/'
  );
  assert.equal(
    getRepoDemoUrl(
      { name: 'gitget', homepage: null, html_url: 'https://github.com/oathanrex/gitget' },
      'oathanrex'
    ),
    'https://oathanrex.github.io/gitget/'
  );
  assert.equal(
    getRepoDemoUrl(
      { name: 'perspective-fix', homepage: 'https://perspectivefix.app/', html_url: 'https://github.com/oathanrex/perspective-fix' },
      'oathanrex'
    ),
    'https://perspectivefix.app/'
  );
});

test('filterRepos handles search, language, starred, and pinned exclusion', () => {
  const bySearch = filterRepos(FALLBACK_REPOS, { searchQuery: 'perspective' });
  assert.equal(bySearch.some((r) => r.name === 'perspective-fix'), true);

  const byLang = filterRepos(FALLBACK_REPOS, { categoryFilter: normalizeLangKey('Python') });
  assert.equal(byLang.length >= 1, true);
  assert.ok(byLang.every((r) => r.language === 'Python'));

  const starredOnly = filterRepos(FALLBACK_REPOS, { categoryFilter: 'starred' });
  assert.ok(starredOnly.every((r) => r.stargazers_count > 0));

  const withoutPinned = filterRepos(FALLBACK_REPOS, {
    categoryFilter: 'all',
    excludePinned: true,
    pinnedNames: ['perspective-fix', 'gitget'],
  });
  assert.equal(withoutPinned.some((r) => r.name === 'perspective-fix'), false);
  assert.equal(withoutPinned.some((r) => r.name === 'gitget'), false);
});

test('sortRepos orders correctly by stars, forks, and name', () => {
  const byStars = sortRepos(FALLBACK_REPOS, 'stars');
  assert.ok(byStars[0].stargazers_count >= byStars[1].stargazers_count);

  const byForks = sortRepos(FALLBACK_REPOS, 'forks');
  assert.ok(byForks[0].forks_count >= byForks[1].forks_count);

  const byName = sortRepos(FALLBACK_REPOS, 'name');
  assert.ok(byName[0].name.localeCompare(byName[1].name) <= 0);
});

test('selectTopStarredRepos ranks non-fork active repos by stars descending', () => {
  const top = selectTopStarredRepos(FALLBACK_REPOS, 4);
  assert.equal(top.length, 4);
  assert.equal(top[0].name, 'perspective-fix');
  assert.ok(top[0].stargazers_count >= top[1].stargazers_count);
});

test('buildFlagshipShowcase blends live star ranking with curated metadata', () => {
  const items = buildFlagshipShowcase(FALLBACK_REPOS, CASE_STUDIES, 4);
  assert.equal(items.length, 4);
  assert.equal(items[0].rank, 1);
  assert.equal(items[0].study.repoName, 'perspective-fix');
  assert.equal(items[0].hasLiveApp, true);
});

test('computeLanguageDistribution aggregates percentages and sorts descending', () => {
  const langs = computeLanguageDistribution(FALLBACK_REPOS, 6);
  assert.ok(langs.length > 0);
  assert.ok(langs[0].count >= langs[langs.length - 1].count);
});

test('computePortfolioStats summarizes totals including starred repo count and public_repos fallback', () => {
  const stats = computePortfolioStats(FALLBACK_REPOS, FALLBACK_PROFILE);
  assert.ok(stats.totalRepos >= FALLBACK_PROFILE.public_repos);
  assert.ok(stats.totalDemos > 0);
  assert.ok(stats.totalStars > 0);
  assert.ok(stats.totalStarredRepos > 0);
});

test('parseSimpleMarkdown extracts headings, lists, code blocks, and paragraphs safely', () => {
  const md = '# Title\n\nIntro paragraph.\n\n- Item 1\n- Item 2\n\n```ts\nconst x = 1;\n```';
  const blocks = parseSimpleMarkdown(md);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'list');
  assert.equal(blocks[3].type, 'code');
});

test('buildProjectBriefMailto constructs valid mailto URI and formats optional active timeline', () => {
  const uri = buildProjectBriefMailto({
    scope: 'Full-Stack Web Product',
    timeline: '2-4 Weeks',
    activeStage: 'Architecture',
    activeTimeline: 'Beta ready Nov 28',
    senderEmail: 'client@example.com',
    notes: 'Launch fast static site',
  });
  assert.ok(uri.startsWith('mailto:oathanrex@gmail.com?subject='));
  assert.ok(uri.includes('Beta%20ready%20Nov%2028'));
  assert.ok(uri.includes('Architecture'));
});

test('selectPinnedRepos fills targetCount with explicit pinned and top non-fork repos', () => {
  const pinned = selectPinnedRepos(FALLBACK_REPOS, ['gitget'], 4);
  assert.equal(pinned.length, 4);
  assert.equal(pinned[0].name, 'gitget');
});

test('webVitals helpers accurately rate and format Core Web Vitals thresholds', () => {
  assert.equal(rateVital('CLS', 0.0), 'good');
  assert.equal(rateVital('CLS', 0.15), 'needs-improvement');
  assert.equal(rateVital('CLS', 0.3), 'poor');
  assert.equal(rateVital('LCP', 1200), 'good');
  assert.equal(formatVitalValue('CLS', 0.05), '0.050');
  assert.equal(formatVitalValue('TTFB', 42.6), '43ms');
});
