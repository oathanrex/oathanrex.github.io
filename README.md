# Oathan Rex | Developer Portfolio

Open-source developer portfolio and live GitHub repository explorer for **Oathan Rex** (`@oathanrex`), built with React 19, TypeScript, Tailwind CSS v4 (OKLCH tokens), and a lazy-loaded interactive Three.js hero particle field.

## Highlights

- **Strict Resource Strategy**: Zero-dependency CSS-vector `BrandLogo` emblem (`src/ui/BrandLogo.tsx`), consolidated `DesignTokens.css` styling, `React.lazy` code-splitting across all sections and modals with height-matched `Suspense` fallbacks, and lazy-loaded Three.js WebGL canvas.
- **Interactive GitHub Explorer**: Fetches live repositories and star rankings from GitHub REST API with `localStorage` cache and snapshot fallback, plus search (`/`), sort, category filters, and an inline README viewer.
- **Project Brief with Active Timeline**: Includes Project Scope, Target Timeline, and optional Active Project Timeline with a 4-stage delivery visualizer.
- **Command Palette & Accessibility**: Quick navigation via `Ctrl/Cmd+K`, keyboard shortcuts (`?`), WCAG AA+ contrast in Light and Dark modes, and `prefers-reduced-motion` compliance.

## Local Development

```bash
npm install
npm run dev     # Serve locally on http://localhost:3000
npm run lint    # Run TypeScript typecheck
npm test        # Run unit test suite
npm run build   # Build production output in dist/
npm run preview # Preview dist/ on http://localhost:4173
```

## Deploy to GitHub Pages

1. Create a repo named `oathanrex.github.io` and upload **all** files from this folder (including the hidden `.github/` folder).
2. Go to **Settings -> Pages -> Build and deployment -> Source** and choose **GitHub Actions**.
3. The workflow (`.github/workflows/deploy.yml`) runs on every push to `main`/`master`: `npm ci`, typecheck, tests, build, deploy `dist/`.
4. If the first run happened before step 2, open the **Actions** tab -> *Deploy to GitHub Pages* -> **Run workflow**.
