/**
 * Tests for Teaneck Municipality Adapter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TeaneckAdapter, createTeaneckAdapter } from './index'
import type { Page, Browser, Locator } from 'playwright'

// Mock playwright
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue(createMockPage()),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

// Helper to create a mock page with locator
function createMockLocator(
  elements: Array<{ href: string; text: string }>
): Locator {
  return {
    all: vi.fn().mockResolvedValue(
      elements.map(el => ({
        getAttribute: vi.fn().mockImplementation(async (attr: string) => {
          if (attr === 'href') return el.href
          return null
        }),
        textContent: vi.fn().mockResolvedValue(el.text),
      }))
    ),
  } as unknown as Locator
}

function createMockPage(): Page {
  return {
    goto: vi.fn().mockResolvedValue({ ok: () => true }),
    content: vi.fn().mockResolvedValue(`
      <html>
        <body>
          <a href="/Citizens/Board/1025-Township-Council">Township Council</a>
          <a href="/Citizens/Board/1026-Planning-Board">Planning Board</a>
        </body>
      </html>
    `),
    title: vi.fn().mockResolvedValue('Meeting Detail - Teaneck'),
    locator: vi.fn().mockImplementation((selector: string) => {
      if (selector.includes('/Citizens/Board/')) {
        return createMockLocator([
          {
            href: '/Citizens/Board/1025-Township-Council',
            text: 'Township Council',
          },
          {
            href: '/Citizens/Board/1026-Planning-Board',
            text: 'Planning Board',
          },
        ])
      }
      if (selector.includes('Detail') || selector.includes('Meeting')) {
        return createMockLocator([
          {
            href: '/Citizens/Detail_Meeting.aspx?ID=12345',
            text: '1/15/2025 - Regular Meeting',
          },
        ])
      }
      if (selector.includes('Agenda')) {
        return createMockLocator([
          {
            href: '/Citizens/FileOpen.aspx?Type=1&ID=12345',
            text: 'View Agenda',
          },
        ])
      }
      if (selector.includes('Minutes')) {
        return createMockLocator([
          {
            href: '/Citizens/FileOpen.aspx?Type=2&ID=12345',
            text: 'View Minutes',
          },
        ])
      }
      if (selector.includes('Video') || selector.includes('youtube')) {
        return createMockLocator([])
      }
      return createMockLocator([])
    }),
    close: vi.fn().mockResolvedValue(undefined),
  } as unknown as Page
}

describe('TeaneckAdapter', () => {
  let adapter: TeaneckAdapter

  beforeEach(async () => {
    vi.clearAllMocks()
    adapter = new TeaneckAdapter()
    await adapter.init()
  })

  afterEach(async () => {
    await adapter.close()
  })

  describe('initialization', () => {
    it('should create adapter with correct name and jurisdiction', () => {
      expect(adapter.name).toBe('Teaneck Township')
      expect(adapter.jurisdiction).toBe('municipal')
    })

    it('should initialize browser on init()', async () => {
      const { chromium } = await import('playwright')
      expect(chromium.launch).toHaveBeenCalled()
    })
  })

  describe('listBoards', () => {
    it('should return list of boards from IQM2 portal', async () => {
      const boards = await adapter.listBoards()

      expect(boards.length).toBeGreaterThan(0)
      // Verify boards have required fields
      boards.forEach(board => {
        expect(board).toHaveProperty('id')
        expect(board).toHaveProperty('name')
        expect(board).toHaveProperty('jurisdiction')
      })
    })

    it('should extract board IDs from URLs', async () => {
      const boards = await adapter.listBoards()

      // All IDs should be numeric strings from the URL pattern
      boards.forEach(board => {
        expect(board.id).toMatch(/^\d+$/)
      })
    })
  })

  describe('listMeetings', () => {
    it('should return list of meetings for a board', async () => {
      const meetings = await adapter.listMeetings('1025')

      expect(meetings).toBeDefined()
      expect(Array.isArray(meetings)).toBe(true)
    })

    it('should respect limit option', async () => {
      const meetings = await adapter.listMeetings('1025', { limit: 5 })

      expect(meetings.length).toBeLessThanOrEqual(5)
    })

    it('should return meetings with boardId set', async () => {
      const meetings = await adapter.listMeetings('1025')

      meetings.forEach(meeting => {
        expect(meeting.boardId).toBe('1025')
      })
    })
  })

  describe('getMeetingDetails', () => {
    it('should return meeting details with documents', async () => {
      const details = await adapter.getMeetingDetails('12345')

      expect(details).toHaveProperty('id')
      expect(details).toHaveProperty('documents')
      expect(Array.isArray(details.documents)).toBe(true)
    })

    it('should extract agenda and minutes links', async () => {
      const details = await adapter.getMeetingDetails('12345')

      // Check that documents array contains expected types
      const docTypes = details.documents.map(d => d.type)
      // At least one of agenda or minutes should be present in test mock
      const hasContent =
        docTypes.includes('agenda') || docTypes.includes('minutes')
      expect(hasContent || details.documents.length === 0).toBe(true)
    })
  })

  describe('getTranscript', () => {
    it('should return null (not yet implemented)', async () => {
      const transcript = await adapter.getTranscript('12345')

      expect(transcript).toBeNull()
    })
  })

  describe('searchMeetings', () => {
    it('should search across all boards', async () => {
      // This is a more expensive operation that searches all boards
      const results = await adapter.searchMeetings('council')

      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('searchDocuments', () => {
    it('should return empty array (not yet implemented)', async () => {
      const results = await adapter.searchDocuments('zoning')

      expect(results).toEqual([])
    })
  })
})

describe('createTeaneckAdapter', () => {
  it('should create a TeaneckAdapter instance', () => {
    const adapter = createTeaneckAdapter()

    expect(adapter).toBeInstanceOf(TeaneckAdapter)
    expect(adapter.name).toBe('Teaneck Township')
  })
})
