# Teaneck Meeting Tracker - Product Requirements Document

## Vision

A civic transparency tool that makes Teaneck Township government meetings accessible and understandable to residents. The system crawls official sources, generates AI-powered summaries, and cross-references agendas with minutes and video recordings.

## Problem Statement

Local government meetings contain important information about community decisions, but:

- Meeting recordings are long (2-4 hours)
- Agendas and minutes are dense PDFs
- Information is scattered across multiple platforms
- No easy way to search or track specific topics over time
- Residents don't have time to stay informed

## Goals

1. **Accessibility**: Make meeting content easy to consume in minutes, not hours
2. **Transparency**: Cross-reference what was planned (agenda) vs what happened (minutes/video)
3. **Searchability**: Enable topic-based search across all meetings
4. **Timeliness**: Surface new meeting content shortly after publication

## Non-Goals (v1)

- Real-time live meeting transcription
- Citizen action/engagement features (commenting, voting)
- Other municipalities (Teaneck only for now)
- Mobile app (web-responsive is sufficient)

---

## Data Sources

### 1. IQM2 Citizens Portal (Granicus)

**URL**: https://teanecktownnj.iqm2.com/Citizens/default.aspx

**Content**:

- Meeting agendas (PDF)
- Meeting minutes (PDF)
- Meeting videos (embedded or linked)
- Historical archive

**Known URL Patterns**:

- `/Citizens/FileOpen.aspx?Type=30&ID={id}` - Document access
- `/Citizens/VideoMain.aspx?MeetingID={id}` - Video outline
- `/Citizens/Board` - Board/committee info

**Technical Challenge**: Dynamic content requires Playwright (simple fetch fails)

### 2. YouTube Channel

**URL**: https://www.youtube.com/@TeaneckNJ07666

**Content**:

- Council meeting recordings
- Workshop recordings
- Special meeting recordings

**Technical Approach**: YouTube Data API for metadata, transcripts via YouTube transcript API or Whisper

### 3. Township Website

**URL**: https://www.teanecknj.gov

**Content**:

- Meeting calendar
- Board/committee member info
- Contact information

---

## Meeting Types to Track

Based on typical municipal structure (to be verified):

| Board/Committee          | Frequency | Priority |
| ------------------------ | --------- | -------- |
| Township Council         | 2x/month  | High     |
| Planning Board           | Monthly   | Medium   |
| Zoning Board             | Monthly   | Medium   |
| Board of Education       | Monthly   | Medium   |
| Library Board            | Monthly   | Low      |
| Environmental Commission | Monthly   | Low      |
| Other advisory boards    | Varies    | Low      |

---

## User Stories

### Resident

- As a resident, I want to see a summary of the latest council meeting so I can stay informed in 5 minutes
- As a resident, I want to search for discussions about "affordable housing" across all meetings
- As a resident, I want to compare what was on the agenda vs what was actually discussed
- As a resident, I want to get notified when a new meeting summary is available

### Power User / Journalist

- As a journalist, I want to track specific topics over time to identify patterns
- As a power user, I want to see the original source documents linked from summaries
- As a power user, I want to export meeting data for my own analysis

---

## Core Features

### Phase 1: Foundation

1. **Data Ingestion Pipeline**
   - Scrape IQM2 portal for agendas/minutes
   - Fetch YouTube video metadata
   - Store raw documents in database

2. **AI Summarization**
   - Generate meeting summaries from agendas
   - Generate meeting summaries from minutes
   - Extract key decisions, votes, and action items

3. **Basic Web Interface**
   - List of meetings by date
   - View summary for each meeting
   - View original documents (PDF viewer or links)

### Phase 2: Cross-Reference

4. **Agenda ↔ Minutes Matching**
   - Match agenda items to corresponding minutes sections
   - Highlight discrepancies (planned vs actual)

5. **Video Integration**
   - Link video timestamps to agenda items
   - Generate video summaries from transcripts

### Phase 3: Search & Discovery

6. **Full-Text Search**
   - Search across all summaries and documents
   - Filter by date range, meeting type, topic

7. **Topic Tracking**
   - Tag meetings by topic (AI-generated)
   - Track topics over time

### Phase 4: Engagement

8. **Notifications**
   - Email alerts for new meetings
   - Topic-based subscriptions

9. **Public API**
   - REST API for meeting data
   - Enable community developers

---

## Technical Architecture

### Multi-Agent System

```
┌─────────────────────────────────────────────────────────────┐
│                     Coordinator Agent                        │
│                 (Orchestrates all agents)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Scraper Agent │    │  Summarizer   │    │Cross-Reference│
│               │    │    Agent      │    │    Agent      │
│ - IQM2 Portal │    │               │    │               │
│ - YouTube API │    │ - Agenda sum  │    │ - Match docs  │
│ - PDF fetch   │    │ - Minutes sum │    │ - Find gaps   │
└───────────────┘    │ - Video trans │    │ - Link items  │
                     └───────────────┘    └───────────────┘
```

### Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | Next.js 16, React 19, Tailwind            |
| Backend    | Next.js API Routes                        |
| Database   | Prisma + SQLite (dev) → PostgreSQL (prod) |
| AI         | Anthropic Claude API                      |
| Scraping   | Playwright (dynamic), Cheerio (static)    |
| Video      | YouTube Data API, youtube-transcript      |
| Deployment | Vercel                                    |

### Data Model (Conceptual)

```
Meeting
  - id, date, type, title
  - boardId
  - status (scheduled, completed, cancelled)

Board
  - id, name, description
  - meetingFrequency

Agenda
  - meetingId
  - pdfUrl, rawText
  - items[] (parsed agenda items)

Minutes
  - meetingId
  - pdfUrl, rawText
  - items[] (parsed minute items)

Video
  - meetingId
  - youtubeId, duration
  - transcript, timestamps

Summary
  - meetingId
  - type (agenda, minutes, video, combined)
  - content, keyPoints[], decisions[], actionItems[]

CrossReference
  - agendaItemId, minutesItemId
  - videoTimestamp
  - status (discussed, tabled, not_discussed)
```

---

## Success Metrics

1. **Coverage**: % of meetings with summaries within 48 hours
2. **Accuracy**: User-reported errors per summary
3. **Engagement**: Unique visitors, time on site, return rate
4. **Performance**: Page load time < 2s, API response < 500ms

---

## Open Questions

1. **IQM2 Access**: Need to manually explore portal to confirm structure and find API patterns
2. **YouTube Transcripts**: Are auto-generated transcripts available? Quality?
3. **Meeting Types**: Need to verify which boards actually meet and publish content
4. **Legal/ToS**: Any restrictions on scraping? Need to respect robots.txt
5. **Historical Data**: How far back should we go? (Suggest: 1 year initially)

---

## Learning Goals

This project is also a learning exercise for:

- Claude Code workflows and best practices
- Multi-agent system design and orchestration
- TDD in TypeScript
- Monorepo management with pnpm workspaces

---

## Timeline

Not time-bound. Milestone-based progression through phases.
