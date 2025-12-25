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

## Feature Development Workflow

For each new feature:

### 1. Identify Next Item

- Check [PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the current milestone and next item
- Create a feature branch: `git checkout -b feature/description`
- Commit and push throughout development

### 2. Flesh Out User Stories

- Expand the user stories from PROJECT_PLAN.md with details
- Add testing stories (how we'll verify it works)
- Identify corner cases and clarifications needed
- **Check in with user** before proceeding

### 3. Create Implementation Plan

- Design the technical approach
- Identify files to create/modify
- Note dependencies and risks
- **Check in with user** and iterate on the plan

### 4. Build Tests First (TDD)

- Write tests based on testing stories
- Tests should fail initially (red)
- Commit the tests

### 5. Build Features

- Implement until tests pass (green)
- Commit working code
- Run full test suite

### 6. User Testing

- **Check in with user** to test together
- Demo the feature
- Address any issues found

### 7. Cleanup & Merge

- Clean up code, add comments if needed
- Update PROJECT_PLAN.md to mark item complete
- Commit final changes
- Create PR: `gh pr create`
- Merge: `gh pr merge --squash`

### 8. Retrospective & Improvements

- Suggest improvements to this workflow itself
- Add any new Skills (slash commands) that would help future work
- Update documentation (CLAUDE.md, PRD.md, etc.) based on lessons learned
- Note any patterns or utilities that should be extracted
- **Check in with user** to review suggestions

## Parallel Work

This project supports parallel development across multiple Claude Code sessions.

**How to work in parallel:**

1. Check [PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the task dependency graph
2. Check what's already claimed:
   ```bash
   git fetch && git branch -r | grep feature/
   ```
3. Pick an unclaimed task with no unfinished dependencies
4. Claim it with a branch name matching the task ID:
   ```bash
   git checkout -b feature/2B.2-mcp-server  # Task 2B.2
   ```
5. Push immediately to signal you've claimed it:
   ```bash
   git push -u origin feature/2B.2-mcp-server
   ```
6. Work independently, create PR when done, merge via squash

**Interfaces for parallel work:**

| Interface                | Best For                                |
| ------------------------ | --------------------------------------- |
| **Web** (claude.ai/code) | Async parallel tasks, no local setup    |
| **CLI + Worktrees**      | Local parallel sessions                 |
| **Cursor/VS Code**       | IDE-integrated, one worktree per window |

**Coordination rules:**

- Each session works on ONE task at a time
- Branch names signal ownership: `feature/2B.2-*` = task 2B.2 is claimed
- Check before starting:
  ```bash
  git fetch
  git branch -r | grep feature/     # See claimed tasks
  git log --oneline main..origin/main  # See recently merged
  ```
- A task's dependencies are "done" when merged to main
- Integration tasks (like 2B.5) wait for all parallel tasks to merge first
- If two sessions accidentally claim the same task, coordinate via PR comments

## Current Status

**Active Milestone:** 2B - Mastra + MCP Architecture

See [PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for full roadmap.

## Claude Code Permissions

Claude has **full read/write access** to all files in this repository.

Claude should NOT:

- Commit `.env*` files
- Push directly to main (use PRs)
- Run destructive git commands without asking
