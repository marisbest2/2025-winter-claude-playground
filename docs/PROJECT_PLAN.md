# Teaneck Meeting Tracker - Project Plan / RFC

## Overview

This document breaks down the PRD into testable, incremental milestones. Each milestone should be independently deployable and verifiable.

**Approach**: Test-Driven Development (TDD) where possible. Write tests first, then implement.

---

## Milestone 0: Data Source Exploration (Research)

**Goal**: Understand the actual data sources before building anything.

### Tasks

- [ ] **0.1** Manual exploration of IQM2 portal
  - Open https://teanecktownnj.iqm2.com/Citizens/default.aspx in browser
  - Document all board/committee types available
  - Document URL patterns for agendas, minutes, videos
  - Check network requests for any JSON APIs
  - Note any authentication requirements

- [ ] **0.2** YouTube channel analysis
  - Document video naming conventions
  - Check if auto-captions are available
  - Note upload frequency and delay from meeting date
  - Test youtube-transcript library on a sample video

- [ ] **0.3** Document findings in `docs/DATA_SOURCES.md`

### Verification

- DATA_SOURCES.md exists with documented URL patterns
- At least 3 sample URLs for agendas, minutes, videos

---

## Milestone 1: Database Schema & Types

**Goal**: Define the data model and generate Prisma client.

### Tasks

- [ ] **1.1** Write Prisma schema (`packages/db/prisma/schema.prisma`)
  - Board model
  - Meeting model
  - Agenda model (with items as JSON)
  - Minutes model (with items as JSON)
  - Video model
  - Summary model

- [ ] **1.2** Create shared TypeScript types (`packages/shared/src/types/`)
  - Zod schemas for validation
  - Inferred TypeScript types from Zod

- [ ] **1.3** Run migration and verify
  ```bash
  pnpm --filter @teaneck/db db:migrate
  ```

### Tests

- [ ] Type compilation passes
- [ ] Can create and query a Meeting record
- [ ] Zod schemas validate correctly

### Verification

```bash
pnpm --filter @teaneck/db db:studio  # Visual inspection
pnpm -r test  # All tests pass
```

---

## Milestone 2: Scraper Agent - IQM2 Portal

**Goal**: Fetch meeting data from IQM2 portal.

### Tasks

- [ ] **2.1** Install Playwright

  ```bash
  pnpm --filter @teaneck/agents add playwright
  ```

- [ ] **2.2** Create IQM2 scraper (`services/agents/src/scrapers/iqm2.ts`)
  - Navigate to portal
  - List all boards
  - For each board, list meetings
  - For each meeting, get agenda/minutes URLs
  - Download PDFs

- [ ] **2.3** Create PDF text extractor
  - Option A: Use Claude API directly (send PDF)
  - Option B: Use pdf-parse for text extraction

- [ ] **2.4** Store scraped data in database

### Tests

- [ ] Unit test: Parse meeting list HTML (mock data)
- [ ] Unit test: Extract document URLs from meeting page
- [ ] Integration test: Scrape one real meeting (can be skipped in CI)

### Verification

- Can run scraper and see meetings in database
- At least 5 meetings with agendas stored

---

## Milestone 3: Scraper Agent - YouTube

**Goal**: Fetch video metadata and transcripts from YouTube.

### Tasks

- [ ] **3.1** Set up YouTube Data API
  - Create Google Cloud project
  - Enable YouTube Data API v3
  - Get API key
  - Add to environment variables

- [ ] **3.2** Create YouTube scraper (`services/agents/src/scrapers/youtube.ts`)
  - Fetch channel videos
  - Match videos to meetings by title/date
  - Get video metadata (duration, publish date)

- [ ] **3.3** Transcript extraction
  - Use youtube-transcript or similar library
  - Fall back to Whisper if needed (future)

- [ ] **3.4** Store video data in database

### Tests

- [ ] Unit test: Parse video title to extract meeting date/type
- [ ] Unit test: Match video to meeting record
- [ ] Integration test: Fetch transcript for one video

### Verification

- Can run YouTube scraper and see videos in database
- At least 3 videos with transcripts stored

---

## Milestone 4: Summarizer Agent

**Goal**: Generate AI summaries of meeting content.

### Tasks

- [ ] **4.1** Create Anthropic client wrapper (`services/agents/src/lib/claude.ts`)
  - Handle API key from env
  - Retry logic
  - Token tracking

- [ ] **4.2** Create agenda summarizer (`services/agents/src/summarizers/agenda.ts`)
  - Input: Agenda PDF or text
  - Output: Structured summary (key items, expected votes, etc.)
  - Prompt engineering for consistent output

- [ ] **4.3** Create minutes summarizer (`services/agents/src/summarizers/minutes.ts`)
  - Input: Minutes PDF or text
  - Output: Structured summary (decisions, votes, action items)

- [ ] **4.4** Create video summarizer (`services/agents/src/summarizers/video.ts`)
  - Input: Transcript text
  - Output: Structured summary with timestamps

- [ ] **4.5** Store summaries in database

### Tests

- [ ] Unit test: Summary output matches expected Zod schema
- [ ] Unit test: Handles empty/malformed input gracefully
- [ ] Integration test: Generate summary for one real agenda

### Verification

- Run summarizer on 3 meetings, review output quality manually
- Summaries stored in database with correct relations

---

## Milestone 5: Cross-Reference Agent

**Goal**: Match agenda items to minutes and video timestamps.

### Tasks

- [ ] **5.1** Create cross-reference agent (`services/agents/src/cross-reference/matcher.ts`)
  - Input: Agenda items, Minutes items
  - Output: Matched pairs with status (discussed, tabled, not discussed)

- [ ] **5.2** Video timestamp linking
  - Match agenda items to transcript sections
  - Extract video timestamps

- [ ] **5.3** Store cross-references in database

### Tests

- [ ] Unit test: Match obvious pairs (same title)
- [ ] Unit test: Handle unmatched items
- [ ] Integration test: Cross-reference one complete meeting

### Verification

- View cross-references in database
- Manual review of matching accuracy

---

## Milestone 6: Coordinator Agent

**Goal**: Orchestrate all agents for end-to-end processing.

### Tasks

- [ ] **6.1** Create coordinator (`services/agents/src/coordinator/index.ts`)
  - Define processing pipeline
  - Handle dependencies (scrape before summarize)
  - Error handling and retries

- [ ] **6.2** Create CLI runner

  ```bash
  pnpm --filter @teaneck/agents start
  # or
  pnpm --filter @teaneck/agents process-meeting --id=123
  ```

- [ ] **6.3** Add job queue (optional, can be simple loop for v1)

### Tests

- [ ] Integration test: Process one meeting end-to-end
- [ ] Test: Handles partial failures gracefully

### Verification

- Run coordinator, see complete meeting data in database
- Logs show clear pipeline progression

---

## Milestone 7: Web UI - Basic Display

**Goal**: Display meetings and summaries on web.

### Tasks

- [ ] **7.1** Create API routes (`apps/web/src/app/api/`)
  - GET /api/meetings - List meetings
  - GET /api/meetings/[id] - Get meeting with summary
  - GET /api/boards - List boards

- [ ] **7.2** Create pages
  - `/` - Homepage with recent meetings
  - `/meetings` - All meetings list
  - `/meetings/[id]` - Meeting detail with summary

- [ ] **7.3** Basic styling with Tailwind

### Tests

- [ ] API route tests with mock data
- [ ] Component tests for meeting card, summary display

### Verification

- Visit localhost:3000, see list of meetings
- Click meeting, see summary

---

## Milestone 8: Web UI - Enhanced Features

**Goal**: Add cross-reference view and search.

### Tasks

- [ ] **8.1** Cross-reference display
  - Side-by-side agenda vs minutes view
  - Visual indicators for match status

- [ ] **8.2** Search functionality
  - Full-text search across summaries
  - Filter by board, date range

- [ ] **8.3** PDF viewer integration
  - Embed or link to original documents

### Tests

- [ ] Search returns expected results
- [ ] Cross-reference view renders correctly

### Verification

- Search for "affordable housing", see relevant meetings
- View cross-reference for a meeting

---

## Milestone 9: Deployment

**Goal**: Deploy to Vercel with production database.

### Tasks

- [ ] **9.1** Set up Vercel project
  - Connect GitHub repo
  - Configure build settings (monorepo)

- [ ] **9.2** Set up production database
  - Vercel Postgres or Neon
  - Update connection string

- [ ] **9.3** Configure environment variables
  - ANTHROPIC_API_KEY
  - DATABASE_URL
  - YOUTUBE_API_KEY

- [ ] **9.4** Set up scheduled scraping
  - Vercel Cron or GitHub Actions
  - Run daily/weekly

### Verification

- Site accessible at public URL
- New meeting appears within 48 hours of publication

---

## Milestone 10: Polish & Launch

**Goal**: Production-ready quality.

### Tasks

- [ ] **10.1** Error handling and logging
- [ ] **10.2** Rate limiting
- [ ] **10.3** SEO optimization
- [ ] **10.4** Analytics
- [ ] **10.5** README and documentation
- [ ] **10.6** Announce to Teaneck community

---

## Development Workflow

### For each milestone:

1. Create feature branch: `git checkout -b milestone-X-description`
2. Write tests first (TDD)
3. Implement until tests pass
4. Manual verification
5. Create PR with summary
6. Squash merge to main

### Commands Reference

```bash
# Development
pnpm dev                           # Start web app
pnpm --filter @teaneck/agents dev  # Watch mode for agents
pnpm -r test                       # Run all tests
pnpm -r test:run                   # Run tests once (CI)

# Database
pnpm --filter @teaneck/db db:migrate  # Run migrations
pnpm --filter @teaneck/db db:studio   # Open Prisma Studio

# Formatting
pnpm format                        # Format all code
pnpm lint                          # Lint all code
```

---

## Dependencies Between Milestones

```
M0 (Research)
 │
 ▼
M1 (Schema) ◄────────────────────┐
 │                               │
 ├──► M2 (IQM2 Scraper)          │
 │     │                         │
 │     ▼                         │
 ├──► M3 (YouTube Scraper)       │
 │     │                         │
 │     ▼                         │
 └──► M4 (Summarizer) ◄──────────┤
       │                         │
       ▼                         │
      M5 (Cross-Reference)       │
       │                         │
       ▼                         │
      M6 (Coordinator)           │
       │                         │
       ▼                         │
      M7 (Basic UI) ─────────────┘
       │
       ▼
      M8 (Enhanced UI)
       │
       ▼
      M9 (Deployment)
       │
       ▼
      M10 (Launch)
```

**Parallelizable**: M2, M3, M4 can be worked on in parallel after M1

---

## Risk Mitigation

| Risk                          | Mitigation                                                |
| ----------------------------- | --------------------------------------------------------- |
| IQM2 blocks scraping          | Use Playwright with human-like delays, respect robots.txt |
| YouTube API quota limits      | Cache aggressively, only fetch new videos                 |
| Claude API costs              | Summarize incrementally, cache results                    |
| PDF parsing failures          | Fall back to Claude vision for complex PDFs               |
| Video transcripts unavailable | Plan for Whisper fallback                                 |

---

## Next Steps

1. Complete Milestone 0 (Research) to confirm data source access
2. Start Milestone 1 (Schema) immediately after
3. Decide on parallel work split for M2/M3/M4
