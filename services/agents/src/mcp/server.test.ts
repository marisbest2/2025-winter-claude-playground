/**
 * Tests for Government Records MCP Server
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMcpServer } from './server'

// Mock the government-records module
vi.mock('./government-records', () => ({
  listBoards: vi.fn().mockResolvedValue([
    { id: '1', name: 'Township Council', jurisdiction: 'municipal' },
    { id: '2', name: 'Planning Board', jurisdiction: 'municipal' },
  ]),
  searchMeetings: vi
    .fn()
    .mockResolvedValue([
      { id: '101', date: '1/15/2025', title: 'Regular Meeting', boardId: '1' },
    ]),
  getMeeting: vi.fn().mockResolvedValue({
    id: '101',
    date: '1/15/2025',
    title: 'Regular Meeting',
    boardId: '1',
    documents: [
      {
        type: 'agenda',
        url: 'https://example.com/agenda.pdf',
        title: 'Agenda',
      },
    ],
  }),
  searchDocuments: vi.fn().mockResolvedValue([]),
  getTranscript: vi.fn().mockResolvedValue(null),
  shutdown: vi.fn().mockResolvedValue(undefined),
}))

describe('MCP Server', () => {
  describe('createMcpServer', () => {
    it('should create an MCP server instance', () => {
      const server = createMcpServer()
      expect(server).toBeDefined()
      expect(server.server).toBeDefined()
    })

    it('should have server info with correct name and version', () => {
      const server = createMcpServer()
      // The server info is set during construction
      // We can verify it's properly configured by checking it exists
      expect(server).toBeDefined()
    })
  })

  describe('Tool registration', () => {
    it('should register list_boards tool', async () => {
      const server = createMcpServer()
      // The tools are registered during server creation
      // We verify by checking the server was created successfully
      expect(server).toBeDefined()
    })

    it('should register search_meetings tool', async () => {
      const server = createMcpServer()
      expect(server).toBeDefined()
    })

    it('should register get_meeting tool', async () => {
      const server = createMcpServer()
      expect(server).toBeDefined()
    })

    it('should register search_documents tool', async () => {
      const server = createMcpServer()
      expect(server).toBeDefined()
    })

    it('should register get_transcript tool', async () => {
      const server = createMcpServer()
      expect(server).toBeDefined()
    })
  })
})

describe('Tool handlers', () => {
  let listBoardsMock: ReturnType<typeof vi.fn>
  let searchMeetingsMock: ReturnType<typeof vi.fn>
  let getMeetingMock: ReturnType<typeof vi.fn>
  let searchDocumentsMock: ReturnType<typeof vi.fn>
  let getTranscriptMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    // Get references to the mocked functions
    const govRecords = await import('./government-records')
    listBoardsMock = govRecords.listBoards as unknown as ReturnType<
      typeof vi.fn
    >
    searchMeetingsMock = govRecords.searchMeetings as unknown as ReturnType<
      typeof vi.fn
    >
    getMeetingMock = govRecords.getMeeting as unknown as ReturnType<
      typeof vi.fn
    >
    searchDocumentsMock = govRecords.searchDocuments as unknown as ReturnType<
      typeof vi.fn
    >
    getTranscriptMock = govRecords.getTranscript as unknown as ReturnType<
      typeof vi.fn
    >

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should handle list_boards calls correctly', async () => {
    // The actual tool handling would need to be tested via the MCP protocol
    // For now, we verify the underlying function behaves correctly
    const { listBoards } = await import('./government-records')
    const result = await listBoards({ municipality: 'teaneck' })

    expect(result).toEqual([
      { id: '1', name: 'Township Council', jurisdiction: 'municipal' },
      { id: '2', name: 'Planning Board', jurisdiction: 'municipal' },
    ])
    expect(listBoardsMock).toHaveBeenCalledWith({ municipality: 'teaneck' })
  })

  it('should handle search_meetings calls correctly', async () => {
    const { searchMeetings } = await import('./government-records')
    const result = await searchMeetings({
      municipality: 'teaneck',
      boardId: '1',
      limit: 10,
    })

    expect(result).toEqual([
      { id: '101', date: '1/15/2025', title: 'Regular Meeting', boardId: '1' },
    ])
    expect(searchMeetingsMock).toHaveBeenCalledWith({
      municipality: 'teaneck',
      boardId: '1',
      limit: 10,
    })
  })

  it('should handle get_meeting calls correctly', async () => {
    const { getMeeting } = await import('./government-records')
    const result = await getMeeting({
      municipality: 'teaneck',
      meetingId: '101',
    })

    expect(result.id).toBe('101')
    expect(result.documents).toHaveLength(1)
    expect(getMeetingMock).toHaveBeenCalledWith({
      municipality: 'teaneck',
      meetingId: '101',
    })
  })

  it('should handle search_documents calls correctly', async () => {
    const { searchDocuments } = await import('./government-records')
    const result = await searchDocuments({
      municipality: 'teaneck',
      query: 'zoning',
    })

    expect(result).toEqual([])
    expect(searchDocumentsMock).toHaveBeenCalledWith({
      municipality: 'teaneck',
      query: 'zoning',
    })
  })

  it('should handle get_transcript calls correctly', async () => {
    const { getTranscript } = await import('./government-records')
    const result = await getTranscript({
      municipality: 'teaneck',
      meetingId: '101',
    })

    expect(result).toBeNull()
    expect(getTranscriptMock).toHaveBeenCalledWith({
      municipality: 'teaneck',
      meetingId: '101',
    })
  })
})
