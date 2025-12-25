# Government Records Deep Research Agent

## Overview

A **deep research agent** for government records that helps lawyers, journalists, and engaged citizens investigate local government decisions across multiple jurisdictions and data sources.

Unlike traditional search tools that return documents, this agent:

- **Decomposes complex queries** into sub-questions
- **Retrieves from multiple sources** (meetings, documents, transcripts, news)
- **Synthesizes answers with citations** showing exactly where information came from
- **Handles contradictions** between sources (agenda vs minutes vs video)
- **Remembers context** across multi-turn conversations

**Target Users**: Lawyers, regulators, journalists, civic researchers

**Current Status**: Basic Q&A prototype working, refactoring to deep research agent architecture.

---

## Tech Stack

| Category       | Technology                                      |
| -------------- | ----------------------------------------------- |
| **Framework**  | Next.js 16, React 19, Tailwind CSS              |
| **Agent SDK**  | Mastra (multi-turn, memory, tool orchestration) |
| **AI Model**   | Anthropic Claude API                            |
| **Tools**      | MCP (Model Context Protocol) servers            |
| **Scraping**   | Playwright (dynamic content)                    |
| **Database**   | Prisma + SQLite (dev) → PostgreSQL (prod)       |
| **Video**      | YouTube Data API, youtube-transcript            |
| **Deployment** | Vercel                                          |

---

## Multi-Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                  (Next.js /qa chat interface)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mastra Coordinator Agent                  │
│                                                              │
│  • Understands user questions                                │
│  • Decides which tools to call                               │
│  • Manages multi-turn conversation state                     │
│  • Synthesizes answers from tool results                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Government Records MCP Server                   │
│                                                              │
│  Domain-driven tools (same interface for all municipalities) │
│    • list_boards       • search_meetings                     │
│    • get_meeting       • search_documents                    │
│    • get_transcript    • search_by_topic                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Teaneck Adapter │ │ [Future]        │ │ [Future]        │
│                 │ │ Other Municipal │ │ County/State    │
│ • IQM2 scraper  │ │                 │ │                 │
│ • YouTube API   │ │ • Granicus API  │ │ • Legistar API  │
│ • teaneck.gov   │ │ • Vimeo         │ │ • YouTube       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │
          ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Cache +      │
│    Mastra mem)  │
└─────────────────┘
```

### Design Principles

- **Domain-driven**: Tools reflect how users think (boards, meetings, documents) not data sources
- **Adapter pattern**: Same tool interface works across different municipalities with different backends
- **Jurisdiction-aware**: Users can filter by municipal, BOE, county, state levels

### Future Agents (Post-MVP)

| Agent              | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| Summarizer Agent   | Generate structured summaries of meetings         |
| Cross-Ref Agent    | Match agenda items to minutes and video           |
| Notification Agent | Alert users to new meetings on topics of interest |

---

## MCP Server Interfaces

### Government Records MCP (Domain-Driven)

Tools are designed around user mental models, not data sources:

| Tool               | Description                                       | Example Query                            |
| ------------------ | ------------------------------------------------- | ---------------------------------------- |
| `list_boards`      | Get boards/committees, optionally by jurisdiction | "What boards exist in Teaneck?"          |
| `search_meetings`  | Find meetings by board, date range, or topic      | "Planning Board meetings about Main St"  |
| `get_meeting`      | Get full meeting details (agenda, minutes, video) | "Details for Dec 15 Council meeting"     |
| `search_documents` | Search across agendas, minutes, resolutions       | "Resolutions about affordable housing"   |
| `get_transcript`   | Get video transcript with timestamps              | "What was said at 45:00?"                |
| `search_by_topic`  | Cross-reference search across all content types   | "Everything about 'Main St development'" |

### Jurisdiction Types

| Level     | Examples                                 |
| --------- | ---------------------------------------- |
| Municipal | Township Council, Planning Board, Zoning |
| BOE       | Board of Education                       |
| County    | Bergen County Freeholders (future)       |
| State     | NJ Legislature (future)                  |

### Adapter Implementations

Each municipality can have different backend systems:

| Municipality | Meeting Portal | Video Platform | Documents    |
| ------------ | -------------- | -------------- | ------------ |
| Teaneck      | IQM2           | YouTube        | IQM2 PDFs    |
| [Future]     | Granicus       | Vimeo          | Legistar     |
| [Future]     | Legistar       | YouTube        | Direct links |

### Cache Tools

| Tool           | Description                        |
| -------------- | ---------------------------------- |
| `search_cache` | Find previously answered questions |
| `get_summary`  | Retrieve cached meeting summary    |

---

## Milestones

### ✅ Milestone 0: Research & Setup

**Status**: Complete

**What we learned**:

- IQM2 portal requires Playwright (dynamic content)
- 11 boards/committees discovered
- Calendar.aspx pages are unreliable (frequent timeouts)
- No authentication required

---

### ✅ Milestone 1: Foundation

**Status**: Complete

**What we built**:

- Monorepo with pnpm workspaces
- Modular IQM2 scraper (extensible for other governments)
- Basic types and interfaces

---

### ✅ Milestone 2A: Basic Q&A Prototype

**Status**: Complete (needs refactoring)

**User Stories**:

- ✅ As a user, I can ask a question about Teaneck meetings
- ✅ As a user, I see sample questions to get started
- ✅ As a user, I get an AI-generated answer in markdown
- ❌ As a user, I can ask follow-up questions (not working)
- ❌ As a user, I get specific meeting data (scraping unreliable)

**Known Issues**:

- Calendar.aspx pages fail → 0 meetings fetched
- Single-turn only → no conversation memory
- 10-15s response time → scrapes everything upfront

---

### 🔄 Milestone 2B: Mastra + MCP Architecture

**Status**: In Progress

**Goal**: Multi-turn agent with intelligent tool use

**User Stories**:

- As a user, I can ask follow-up questions and the agent remembers context
- As a user, I see which tools the agent used to answer my question
- As a user, I get fast responses when asking similar questions (cached)
- As a user, the agent gracefully handles scraping failures and tells me what it tried

**Testing Stories**:

- Agent uses `search_cache` before scraping
- Agent calls `list_boards` for board-related questions
- Agent retries different boards when `list_meetings` fails
- Conversation history persists across page refreshes
- Tool calls are visible in UI

---

### Milestone 3: Scraper Reliability

**Goal**: Fix Calendar.aspx scraping issues

**User Stories**:

- As a user, I can see recent meeting data (not just board names)
- As a user, I get cached data quickly when scraping is slow

**Testing Stories**:

- At least 3 boards return meeting data successfully
- Scraper cache reduces redundant requests
- Fallback to cached data when live scraping fails

---

### Milestone 4: YouTube Integration

**Goal**: Add video metadata and transcripts

**User Stories**:

- As a user, I can ask "What was discussed at the last council meeting?"
- As a user, I get links to relevant video timestamps
- As a user, I can search across video transcripts

**Testing Stories**:

- Videos are matched to meetings by date/title
- Transcripts are fetched and searchable
- YouTube MCP tools are available to agent

---

### Milestone 5: Summarization

**Goal**: Generate AI summaries of meeting content

**User Stories**:

- As a user, I can see a 2-minute summary of any meeting
- As a user, I can see what votes were taken
- As a user, I can see action items from a meeting

**Testing Stories**:

- Agenda PDFs are parsed and summarized
- Minutes are parsed with vote extraction
- Video transcripts are summarized with timestamps
- Summaries are cached in database

---

### Milestone 6: Cross-Reference

**Goal**: Match agenda items to minutes and video

**User Stories**:

- As a user, I can see which agenda items were actually discussed
- As a user, I can jump to the video timestamp for any agenda item
- As a user, I can compare "what was planned" vs "what happened"

**Testing Stories**:

- Agenda items are matched to corresponding minutes sections
- Video timestamps are linked to agenda items
- UI shows side-by-side comparison

---

### Milestone 7: Search & Discovery

**Goal**: Full-text search and topic tracking

**User Stories**:

- As a user, I can search for "affordable housing" across all meetings
- As a user, I can filter by board and date range
- As a user, I can track a topic over time

**Testing Stories**:

- Full-text search returns relevant results
- Filters work correctly
- Topic tracking shows chronological results

---

### Milestone 8: Production Deployment

**Goal**: Deploy to production with real database

**User Stories**:

- As a user, I can access the site at a public URL
- As a user, new meetings appear within 48 hours

**Testing Stories**:

- Site is deployed to Vercel
- PostgreSQL database is configured
- Scheduled scraping runs daily
- Environment variables are secured

---

### Milestone 9: Polish & Launch

**Goal**: Production-ready quality

**User Stories**:

- As a user, I get helpful error messages
- As a user, the site is fast and responsive
- As a Teaneck resident, I can share meeting summaries on social media

**Testing Stories**:

- Error handling covers edge cases
- SEO metadata is configured
- Analytics are tracking usage
- Rate limiting prevents abuse

---

## Dependency Graph

```
✅ M0 (Research)
 │
 ▼
✅ M1 (Foundation)
 │
 ▼
✅ M2A (Basic Q&A)
 │
 ▼
🔄 M2B (Mastra + MCP) ◄─────────────┐
 │                                  │
 ├──► M3 (Scraper Reliability)      │
 ├──► M4 (YouTube)                  │
 └──► M5 (Summarization)            │
       │                            │
       ▼                            │
      M6 (Cross-Reference)          │
       │                            │
       ▼                            │
      M7 (Search) ──────────────────┘
       │
       ▼
      M8 (Deployment)
       │
       ▼
      M9 (Launch)
```

**Parallelizable**: After M2B, milestones 3/4/5 can be worked on in parallel.

---

## Risk Mitigation

| Risk                   | Mitigation                                   |
| ---------------------- | -------------------------------------------- |
| IQM2 blocks scraping   | Human-like delays, respect robots.txt        |
| Calendar.aspx timeouts | `retry_meetings` tool, cache aggressively    |
| YouTube quota limits   | Cache transcripts, only fetch new videos     |
| Claude API costs       | Cache answers, use `search_cache` tool first |
| PDF parsing failures   | Fall back to Claude vision                   |

---

## Next Steps

1. Install Mastra and configure PostgreSQL storage
2. Build IQM2 MCP server with retry logic
3. Integrate Mastra agent with multi-turn memory
4. Update UI for conversation history and tool transparency
