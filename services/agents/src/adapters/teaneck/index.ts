/**
 * Teaneck Municipality Adapter
 *
 * Implements the MunicipalityAdapter interface for Teaneck Township, NJ.
 * Data sources:
 * - IQM2 portal for meetings, agendas, minutes
 * - YouTube for video recordings and transcripts (future)
 */

import { chromium, Browser, Page } from 'playwright'
import type {
  MunicipalityAdapter,
  Board,
  Meeting,
  MeetingDetails,
  MeetingDocument,
} from '../types'

const IQM2_BASE_URL = 'https://teanecktownnj.iqm2.com/Citizens'
const YOUTUBE_CHANNEL = '@TeaneckNJ07666'

export class TeaneckAdapter implements MunicipalityAdapter {
  readonly name = 'Teaneck Township'
  readonly jurisdiction = 'municipal'

  private browser: Browser | null = null
  private page: Page | null = null

  async init(): Promise<void> {
    console.log(`[TeaneckAdapter] Initializing...`)
    console.log(`  IQM2 Portal: ${IQM2_BASE_URL}`)
    console.log(`  YouTube: ${YOUTUBE_CHANNEL}`)

    this.browser = await chromium.launch({
      headless: true,
    })
    this.page = await this.browser.newPage()
  }

  async close(): Promise<void> {
    console.log(`[TeaneckAdapter] Closing...`)
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  private ensureInitialized(): Page {
    if (!this.page) {
      throw new Error('TeaneckAdapter not initialized. Call init() first.')
    }
    return this.page
  }

  async listBoards(): Promise<Board[]> {
    const page = this.ensureInitialized()
    console.log(`[TeaneckAdapter] listBoards()`)

    // Navigate to the Board listing page
    await page.goto(`${IQM2_BASE_URL}/Board`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const boards: Board[] = []
    const content = await page.content()

    // Primary pattern: /Citizens/Board/1025-Board-of-Adjustment
    // The URL contains the ID followed by a slugified name
    const boardPathPattern = /\/Citizens\/Board\/(\d+)-([^"]+)"/gi
    let match: RegExpExecArray | null
    while ((match = boardPathPattern.exec(content)) !== null) {
      const id = match[1]
      const slug = match[2]
      if (id && slug) {
        // Convert slug back to readable name: "Board-of-Adjustment" -> "Board of Adjustment"
        const name = slug.replace(/-/g, ' ').trim()
        if (name && !boards.some(b => b.id === id)) {
          boards.push({ id, name, jurisdiction: 'municipal' })
        }
      }
    }

    // Fallback: use Playwright locators if regex didn't work
    if (boards.length === 0) {
      const links = await page.locator('a[href*="/Citizens/Board/"]').all()
      for (const link of links) {
        const href = await link.getAttribute('href')
        const text = await link.textContent()

        if (href && text) {
          const m = href.match(/\/Citizens\/Board\/(\d+)-/)
          if (m?.[1]) {
            const name = text.trim()
            if (name && name.length > 2 && !boards.some(b => b.id === m[1])) {
              boards.push({ id: m[1], name, jurisdiction: 'municipal' })
            }
          }
        }
      }
    }

    console.log(`[TeaneckAdapter] Found ${boards.length} boards`)
    return boards
  }

  async listMeetings(
    boardId: string,
    options?: { limit?: number }
  ): Promise<Meeting[]> {
    const page = this.ensureInitialized()
    const limit = options?.limit ?? 50
    console.log(`[TeaneckAdapter] listMeetings(${boardId}, limit=${limit})`)

    // Navigate to the board's meeting list
    await page.goto(`${IQM2_BASE_URL}/Calendar.aspx?Board=${boardId}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const meetings: Meeting[] = []

    // Look for meeting links/rows
    const meetingLinks = await page
      .locator('a[href*="Detail"], a[href*="Meeting"]')
      .all()

    for (const link of meetingLinks) {
      if (meetings.length >= limit) break

      const href = await link.getAttribute('href')
      const text = await link.textContent()

      if (href && text) {
        // Extract meeting ID from URL
        const idMatch = href.match(/[Mm]eeting[=/](\d+)|Detail[_\.].*ID=(\d+)/i)
        const id = idMatch?.[1] ?? idMatch?.[2]

        // Try to extract date from text
        const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)
        const date = dateMatch?.[1] ?? ''

        if (id && !meetings.some(m => m.id === id)) {
          meetings.push({
            id,
            date,
            title: text.trim(),
            boardId,
          })
        }
      }
    }

    console.log(`[TeaneckAdapter] Found ${meetings.length} meetings`)
    return meetings
  }

  async getMeetingDetails(meetingId: string): Promise<MeetingDetails> {
    const page = this.ensureInitialized()
    console.log(`[TeaneckAdapter] getMeetingDetails(${meetingId})`)

    await page.goto(`${IQM2_BASE_URL}/Detail_Meeting.aspx?ID=${meetingId}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const documents: MeetingDocument[] = []

    // Look for agenda links
    const agendaLinks = await page
      .locator('a[href*="Agenda"], a:has-text("Agenda")')
      .all()

    for (const link of agendaLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      if (href) {
        documents.push({
          type: 'agenda',
          url: href.startsWith('http') ? href : `${IQM2_BASE_URL}/${href}`,
          title: text?.trim() ?? 'Agenda',
        })
      }
    }

    // Look for minutes links
    const minutesLinks = await page
      .locator('a[href*="Minutes"], a:has-text("Minutes")')
      .all()

    for (const link of minutesLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      if (href) {
        documents.push({
          type: 'minutes',
          url: href.startsWith('http') ? href : `${IQM2_BASE_URL}/${href}`,
          title: text?.trim() ?? 'Minutes',
        })
      }
    }

    // Look for video links
    const videoLinks = await page
      .locator('a[href*="Video"], a[href*="youtube"], a:has-text("Video")')
      .all()

    let videoUrl: string | undefined

    for (const link of videoLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      if (href) {
        const fullUrl = href.startsWith('http')
          ? href
          : `${IQM2_BASE_URL}/${href}`
        documents.push({
          type: 'video',
          url: fullUrl,
          title: text?.trim() ?? 'Video',
        })
        if (!videoUrl) {
          videoUrl = fullUrl
        }
      }
    }

    // Try to extract title and date from page content
    const pageTitle = await page.title()
    const titleMatch = pageTitle.match(/(.+?)\s*[-|]\s*(.+)/)
    const title = titleMatch?.[1]?.trim() ?? `Meeting ${meetingId}`

    // Try to find date on the page
    const content = await page.content()
    const dateMatch = content.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)
    const date = dateMatch?.[1] ?? ''

    // Try to find board info
    const boardMatch = content.match(/Board[:\s]+([^<\n]+)/i)
    const boardId = boardMatch?.[1]?.trim() ?? ''

    console.log(`[TeaneckAdapter] Found ${documents.length} documents`)

    return {
      id: meetingId,
      date,
      title,
      boardId,
      documents,
      videoUrl,
    }
  }

  async getTranscript(meetingId: string): Promise<string | null> {
    console.log(`[TeaneckAdapter] getTranscript(${meetingId})`)
    // TODO: Implement YouTube transcript fetching
    // This will be implemented in Milestone 4 (YouTube Integration)
    console.log(`  YouTube transcripts not yet implemented`)
    return null
  }

  async searchMeetings(query: string): Promise<Meeting[]> {
    this.ensureInitialized()
    console.log(`[TeaneckAdapter] searchMeetings(${query})`)

    // IQM2 doesn't have a great search interface, so we'll
    // search across all boards and filter results
    const boards = await this.listBoards()
    const allMeetings: Meeting[] = []

    const queryLower = query.toLowerCase()

    for (const board of boards) {
      const meetings = await this.listMeetings(board.id, { limit: 20 })

      for (const meeting of meetings) {
        // Check if query matches meeting title or board name
        if (
          meeting.title.toLowerCase().includes(queryLower) ||
          board.name.toLowerCase().includes(queryLower)
        ) {
          allMeetings.push({
            ...meeting,
            boardName: board.name,
          })
        }
      }
    }

    console.log(
      `[TeaneckAdapter] Found ${allMeetings.length} matching meetings`
    )
    return allMeetings
  }

  async searchDocuments(query: string): Promise<MeetingDocument[]> {
    console.log(`[TeaneckAdapter] searchDocuments(${query})`)
    // TODO: Implement document search
    // This would require downloading and indexing PDFs
    // For now, return empty - will be implemented in Milestone 7
    console.log(`  Document search not yet implemented`)
    return []
  }
}

export function createTeaneckAdapter(): MunicipalityAdapter {
  return new TeaneckAdapter()
}
