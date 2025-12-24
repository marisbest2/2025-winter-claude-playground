import { chromium, Browser, Page } from 'playwright'
import type {
  Board,
  Meeting,
  MeetingDocument,
  MeetingSystemScraper,
} from '../types'

export abstract class IQM2BaseScraper implements MeetingSystemScraper {
  readonly systemType = 'iqm2'

  protected abstract readonly baseUrl: string

  protected browser: Browser | null = null
  protected page: Page | null = null

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    })
    this.page = await this.browser.newPage()
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async canConnect(): Promise<boolean> {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call init() first.')
    }

    try {
      const response = await this.page.goto(`${this.baseUrl}/default.aspx`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      })
      return response !== null && response.ok()
    } catch {
      return false
    }
  }

  async getPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call init() first.')
    }
    return this.page.content()
  }

  async listBoards(): Promise<Board[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call init() first.')
    }

    // Navigate to the Board listing page
    await this.page.goto(`${this.baseUrl}/Board`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const boards: Board[] = []
    const content = await this.page.content()

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
          boards.push({ id, name })
        }
      }
    }

    // Fallback: use Playwright locators if regex didn't work
    if (boards.length === 0) {
      const links = await this.page.locator('a[href*="/Citizens/Board/"]').all()
      for (const link of links) {
        const href = await link.getAttribute('href')
        const text = await link.textContent()

        if (href && text) {
          const m = href.match(/\/Citizens\/Board\/(\d+)-/)
          if (m?.[1]) {
            const name = text.trim()
            if (name && name.length > 2 && !boards.some(b => b.id === m[1])) {
              boards.push({ id: m[1], name })
            }
          }
        }
      }
    }

    return boards
  }

  async listMeetings(boardId: string): Promise<Meeting[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call init() first.')
    }

    // Navigate to the board's meeting list
    await this.page.goto(`${this.baseUrl}/Calendar.aspx?Board=${boardId}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    const meetings: Meeting[] = []

    // Look for meeting links/rows
    const meetingLinks = await this.page
      .locator('a[href*="Detail"], a[href*="Meeting"]')
      .all()

    for (const link of meetingLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()

      if (href && text) {
        // Extract meeting ID from URL
        const idMatch = href.match(/[Mm]eeting[=/](\d+)/)
        const id = idMatch?.[1]

        // Try to extract date from text
        const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)
        const date = dateMatch?.[1] ?? ''

        if (id) {
          meetings.push({
            id,
            date,
            title: text.trim(),
            boardId,
          })
        }
      }
    }

    return meetings
  }

  async getMeetingDocuments(meetingId: string): Promise<MeetingDocument[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call init() first.')
    }

    await this.page.goto(
      `${this.baseUrl}/Detail_Meeting.aspx?ID=${meetingId}`,
      {
        waitUntil: 'networkidle',
        timeout: 30000,
      }
    )

    const documents: MeetingDocument[] = []

    // Look for agenda links
    const agendaLinks = await this.page
      .locator('a[href*="Agenda"], a:has-text("Agenda")')
      .all()

    for (const link of agendaLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      if (href) {
        documents.push({
          type: 'agenda',
          url: href.startsWith('http') ? href : `${this.baseUrl}/${href}`,
          title: text?.trim() ?? 'Agenda',
        })
      }
    }

    // Look for minutes links
    const minutesLinks = await this.page
      .locator('a[href*="Minutes"], a:has-text("Minutes")')
      .all()

    for (const link of minutesLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      if (href) {
        documents.push({
          type: 'minutes',
          url: href.startsWith('http') ? href : `${this.baseUrl}/${href}`,
          title: text?.trim() ?? 'Minutes',
        })
      }
    }

    // Look for video links
    const videoLinks = await this.page
      .locator('a[href*="Video"], a:has-text("Video")')
      .all()

    for (const link of videoLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      if (href) {
        documents.push({
          type: 'video',
          url: href.startsWith('http') ? href : `${this.baseUrl}/${href}`,
          title: text?.trim() ?? 'Video',
        })
      }
    }

    return documents
  }
}
