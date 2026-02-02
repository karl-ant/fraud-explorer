# Changelog

All notable changes to Fraud Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-02-02

### Added
- **Theme switcher** with dropdown in Navigation header (3 themes: Mission Control, Neobank, Arctic Intel)
- **ThemeContext** (`src/context/ThemeContext.tsx`) managing theme state with localStorage persistence
- Theme-specific fonts: Orbitron/IBM Plex (Mission Control), DM Sans/Fira Code (Neobank), Lexend/JetBrains Mono (Arctic Intel)
- CSS custom properties using RGB triplets for Tailwind opacity support (e.g., `--space-deep: 13 21 38`)
- Theme-aware chart colors via CSS custom properties (DonutChart, BarChart adapt to active theme)

### Changed
- Navigation header includes theme dropdown with icon indicators (Radar, Landmark, Snowflake)
- `globals.css` expanded with 3 complete theme definitions including grid patterns, shadows, and chart colors
- All themes use `[data-theme="..."]` attribute selector on `documentElement`

## [1.4.0] - 2026-02-02

### Added
- **Dashboard page** (`/dashboard`) with SVG-based charts (DonutChart, BarChart, StatCard) - no external dependencies
- **Transaction detail drawer** - slide-in panel showing full transaction details, metadata, and fraud cross-referencing
- **Client-side FilterBar** - status, processor, and amount range filters above the DataTable
- **Analytics utility** (`src/lib/analytics.ts`) with 5 pure computation functions and 15 tests
- **Pagination** for DataTable with page size selector (25/50/100)
- **Type safety interfaces** - `ClaudeQueryResponse`, `ClaudeFilters`, `TransactionFilters` in `src/types/index.ts`
- **Post-push review hook** - detects `git push` and prompts to run `/post-push-review`
- **`/post-push-review` command** - runs design-review, tech-lead-code-reviewer, test, and sync-docs agents in parallel
- `CHANGELOG.md` - this file

### Changed
- DataTable sorting wrapped in `useMemo` for performance
- DataTable rows clickable when `onSelectTransaction` callback is provided
- Navigation includes Dashboard tab with BarChart3 icon
- API route uses singleton mock clients instead of per-request instantiation
- `tsconfig.json` target updated from `es5` to `es2015` (required for Map iteration)
- `AppError` uses `Object.setPrototypeOf` for correct `instanceof` in ES2015+
- `paypal-mock.ts` ternary type assertions changed from `as const` to `as TransactionData['status']`
- `design-review` and `sync-docs` moved from `.claude/commands/` to `.claude/agents/` with YAML frontmatter
- `test.md` agent enhanced with project-specific conventions, mocking patterns, and example references
- `tech-lead-code-reviewer.md` agent enhanced with design system tokens, type safety, and error handling context

### Removed
- `axios` dependency (unused)
- `.claude/commands/design-review.md` (moved to agents)
- `.claude/commands/sync-docs.md` (moved to agents)
- All `any` types in `src/app/api/query/route.ts`

### Fixed
- `error-handler.test.ts` updated to expect correct `instanceof AppError` behavior after ES2015 target change

## [1.3.0] - 2026-01-12

### Added
- Jest + ts-jest test infrastructure (`jest.config.js`)
- 229 tests across 6 test files with 73%+ code coverage
- Test files for all `src/lib/` modules: `error-handler.test.ts` (17 tests), `fraud-detector.test.ts` (36 tests), `mock-generator.test.ts` (42 tests), `claude.test.ts` (32 tests), `adyen-mock.test.ts` (73 tests), `paypal-mock.test.ts` (64 tests)
- Test subagent at `.claude/agents/test.md` for writing Jest tests
- npm scripts: `test`, `test:watch`, `test:coverage`
- Claude Code Review and PR Assistant GitHub Actions workflows

### Fixed
- Hardcoded `'usd'` currency in `mock-generator.ts` now uses `getCurrency()` for correct multi-currency support

## [1.2.0] - 2025-12-11

### Added
- Multi-page navigation with tab bar (Query | Generator) using Next.js App Router
- `TransactionContext` (`src/context/TransactionContext.tsx`) for shared state across pages
- SessionStorage persistence for generated transactions (survives refresh, clears on tab close)
- Live validation indicators in Generator showing real-time totals for fraud mix and status distribution
- "View in Query" button to navigate from Generator to Query page with data pre-loaded
- Auto-display of generated data when navigating to Query page

### Changed
- Mock Transaction Generator moved from inline on Query page to dedicated `/generator` route
- Generator UI: always expanded, 3-column fraud sliders, 4-column status distribution layout
- Navigation component (`src/components/Navigation.tsx`) added with Query and Generator tabs

### Fixed
- Race condition in auto-display `useEffect` that caused state conflicts during loading

## [1.1.0] - 2025-12-11

### Added
- Adyen mock payment processor (`src/lib/adyen-mock.ts`) with 8 fraud patterns: card testing, 3DS authentication failures, EU cross-border, account takeover, velocity fraud, high-risk countries, round number fraud, legitimate transactions
- Mock Transaction Generator component (`src/components/MockTransactionGenerator.tsx`) with configurable transaction count, processor selection, date range, fraud pattern mix (8 patterns + legitimate), and status distribution
- Mock generator library (`src/lib/mock-generator.ts`) with validation and transaction generation logic
- Structured Claude query processing - Claude returns JSON with explicit filters instead of relying on regex parsing
- Legacy regex-based query fallback (`parseQueryToFiltersLegacy`) when Claude parsing fails
- Adyen processor toggle in QueryInterface and purple badge styling in DataTable
- Adyen status indicator in footer

### Changed
- Dark theme lightened from near-black to dark slate blue (`space-deep: #0d1526`)
- Example queries collapsed by default with accordion toggle
- Fraud pattern cards show compact headers (icon, name, badge, count), expand on click to show full details
- Query processing rewritten: `parseQueryToFilters` replaced by `applyClaudeFilters` using Claude's structured response
- Claude prompt updated to return structured JSON with filters, intent, and explanation

### Fixed
- JSON parsing vulnerability in `claude.ts` - added validation for parsed response structure, field types, and logging limits
- Silent error fallback in `route.ts` - API/network errors now propagate to user instead of silently falling back to regex parsing
- Markdown code block stripping from Claude responses (handles ` ```json ... ``` ` wrapping)
- Overly strict validation in Claude response parsing relaxed to handle partial responses

## [1.0.0] - 2025-11-18

### Added
- Mission Control dark theme with custom Tailwind design system (`tailwind.config.js`)
- Semantic color tokens: `space-*` backgrounds, `terminal-*` accents, `risk-*` levels, `status-*` indicators
- Custom typography: Orbitron (display), IBM Plex Sans (body), IBM Plex Mono (data)
- Glow effects, animated status badges, grid background pattern
- Custom scrollbar, terminal-style input fields, panel components
- Design review command at `.claude/commands/design-review.md`
- Stripe MCP documentation in `CLAUDE.md`

### Changed
- Complete frontend redesign from default styling to space-inspired command center aesthetic
- Processor selection changed from dropdown to segmented toggle control
- DataTable, FraudPatterns, and QueryInterface components restyled for dark theme
- Removed ThemeProvider and ThemeToggle (dark-only theme)

## [0.1.0] - 2025-11-03

### Added
- Natural language query interface powered by Claude AI (`src/lib/claude.ts`)
- Stripe MCP client with real and mock data support (`src/lib/stripe-mcp.ts`)
- PayPal mock client with 8 fraud patterns (`src/lib/paypal-mock.ts`)
- Fraud detection engine with 8 pattern algorithms (`src/lib/fraud-detector.ts`): card testing, velocity fraud, high-risk geography, round number fraud, off-hours transactions, retry attacks, high-value international, cryptocurrency fraud
- API endpoint for query processing (`src/app/api/query/route.ts`)
- Interactive sortable DataTable component (`src/components/DataTable.tsx`)
- Fraud pattern visualization with risk-level badges (`src/components/FraudPatterns.tsx`)
- Query interface with example queries (`src/components/QueryInterface.tsx`)
- Error handling utilities (`src/lib/error-handler.ts`)
- TypeScript type definitions (`src/types/index.ts`)
- Next.js 14 application with TypeScript and Tailwind CSS
- Tech lead code reviewer agent (`.claude/agents/tech-lead-code-reviewer.md`)
