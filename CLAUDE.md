# Teaneck Meeting Tracker

## Project Overview

A civic transparency tool that makes Teaneck Township (NJ) government meetings accessible. Crawls official sources, generates AI summaries, and cross-references agendas with minutes and video.

**Documentation:**
- [PRD](docs/PRD.md) - Product requirements and vision
- [Project Plan](docs/PROJECT_PLAN.md) - Milestones and implementation plan

## Architecture

```
apps/
  web/                 # Next.js frontend
services/
  agents/              # Multi-agent orchestration
    coordinator/       # Main orchestrator
    scrapers/          # IQM2, YouTube scrapers
    summarizers/       # AI summarization
    cross-reference/   # Document matching
  python/              # Reserved for Python services
packages/
  shared/              # Shared types and utilities
  db/                  # Prisma database client
```

## Data Sources

- **IQM2 Portal**: https://teanecktownnj.iqm2.com/Citizens/default.aspx (requires Playwright)
- **YouTube**: https://www.youtube.com/@TeaneckNJ07666
- **Township Site**: https://www.teanecknj.gov

## Tech Stack

- TypeScript + Next.js 16 + React 19 + Tailwind
- Prisma + SQLite (dev) → PostgreSQL (prod)
- Anthropic Claude API for summarization
- Playwright for dynamic scraping
- pnpm workspaces monorepo

## Git Workflow

**Always follow gitflow with squash merges:**

1. `git checkout -b feature/description` (or `milestone-X/description`)
2. Make commits, push branch
3. `gh pr create --title "..." --body "..."`
4. `gh pr merge <number> --squash`
5. `git checkout main && git pull && git branch -d feature/description`

**Branch prefixes:** `feature/`, `fix/`, `docs/`, `milestone-X/`

## Commands

```bash
# Development
pnpm dev                              # Start web app
pnpm --filter @teaneck/agents dev     # Watch agents
pnpm -r test                          # Test all packages
pnpm format                           # Format code

# Database
pnpm --filter @teaneck/db db:migrate  # Run migrations
pnpm --filter @teaneck/db db:studio   # Open Prisma Studio

# Single package
pnpm --filter @teaneck/web build      # Build web only
pnpm --filter @teaneck/agents test    # Test agents only
```

## Environment Variables

Required in `.env.local` (root) or `.env` (packages/db):

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL="file:./dev.db"
YOUTUBE_API_KEY=...  # Optional until Milestone 3
```

**Never paste API keys in chat.** Use:
```bash
read -s KEY && echo "ANTHROPIC_API_KEY=$KEY" >> .env.local
```

## Code Style

- Prettier for formatting (pre-commit hook)
- ESLint for linting
- TypeScript strict mode enabled
- Zod for runtime validation
- TDD where possible (write tests first)

## Current Status

**Active Milestone:** 0 - Data Source Exploration

See [PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for full roadmap.

## Claude Code Permissions

Claude has full read/write access to:
- All source code in `apps/`, `services/`, `packages/`
- Documentation in `docs/`
- Configuration files (package.json, tsconfig, etc.)
- Git operations (branches, commits, PRs)

Claude should NOT:
- Commit `.env*` files
- Push directly to main (use PRs)
- Run destructive git commands without asking
