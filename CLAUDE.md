# Government Records Deep Research Agent

## Project Overview

A **deep research agent** for government records that helps lawyers, journalists, and engaged citizens investigate local government decisions across multiple jurisdictions and data sources.

Unlike simple search, this agent:

- **Decomposes complex queries** into sub-questions
- **Retrieves from multiple sources** (meetings, documents, transcripts)
- **Synthesizes answers with citations**
- **Handles contradictions** between sources
- **Remembers context** across conversations

**Documentation:**

- [PRD](docs/PRD.md) - Product requirements and vision
- [Project Plan](docs/PROJECT_PLAN.md) - Milestones and architecture
- [Deep Research Notes](docs/DEEP_RESEARCH_NOTES.md) - Patterns from reference implementations

## Architecture

```
apps/
  web/                     # Next.js frontend

services/
  agents/
    src/
      mcp/                 # Domain-driven MCP server
        government-records.ts   # list_boards, search_meetings, etc.

      adapters/            # Municipality-specific backends
        teaneck/           # Teaneck (IQM2 + YouTube)
        # future: other municipalities

      research/            # Deep research components
        planner.ts         # Query decomposition
        researcher.ts      # Execute research plan
        synthesizer.ts     # Combine findings with citations

      coordinator/         # Mastra agent orchestration

  python/                  # Reserved for Python services

packages/
  shared/                  # Shared types and utilities
  db/                      # Prisma database client
```

## Data Sources

- **IQM2 Portal**: https://teanecktownnj.iqm2.com/Citizens/default.aspx (requires Playwright)
- **YouTube**: https://www.youtube.com/@TeaneckNJ07666
- **Township Site**: https://www.teanecknj.gov

## Tech Stack

- TypeScript + Next.js 16 + React 19 + Tailwind
- Mastra (agent orchestration, memory, tool use)
- MCP (Model Context Protocol) for domain-driven tools
- Prisma + SQLite (dev) → PostgreSQL (prod)
- Anthropic Claude API
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

**Active Milestone:** 2B - Mastra + MCP Architecture

See [PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for full roadmap.

## Claude Code Permissions

Claude has **full read/write access** to all files in this repository.

Claude should NOT:

- Commit `.env*` files
- Push directly to main (use PRs)
- Run destructive git commands without asking
