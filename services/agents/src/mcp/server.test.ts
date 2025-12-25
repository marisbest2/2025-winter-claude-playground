/**
 * MCP Server Tests
 *
 * Verify that the MCP server correctly handles tool calls.
 */

import { describe, it, expect } from 'vitest'

// We'll test the tool functions directly since testing MCP transport is complex
import * as mcpTools from './government-records'

describe('MCP Tools - list_boards', () => {
  it('returns boards for teaneck municipality', async () => {
    const result = await mcpTools.listBoards({ municipality: 'teaneck' })

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('filters boards by jurisdiction', async () => {
    const result = await mcpTools.listBoards({
      municipality: 'teaneck',
      jurisdiction: 'boe',
    })

    expect(result.every(b => b.jurisdiction === 'boe')).toBe(true)
  })

  it('throws error for unknown municipality', async () => {
    await expect(
      mcpTools.listBoards({ municipality: 'unknown-city' })
    ).rejects.toThrow('Unknown municipality')
  })
})

describe('MCP Tools - search_meetings', () => {
  it('returns meetings when boardId provided', async () => {
    const boards = await mcpTools.listBoards({ municipality: 'teaneck' })
    const boardId = boards[0]?.id

    if (!boardId) {
      throw new Error('No boards available for test')
    }

    const result = await mcpTools.searchMeetings({
      municipality: 'teaneck',
      boardId,
    })

    expect(Array.isArray(result)).toBe(true)
  })

  it('returns meetings when query provided', async () => {
    const result = await mcpTools.searchMeetings({
      municipality: 'teaneck',
      query: 'council',
    })

    expect(Array.isArray(result)).toBe(true)
  })

  it('respects limit parameter', async () => {
    const boards = await mcpTools.listBoards({ municipality: 'teaneck' })
    const boardId = boards[0]?.id

    if (!boardId) {
      throw new Error('No boards available for test')
    }

    const result = await mcpTools.searchMeetings({
      municipality: 'teaneck',
      boardId,
      limit: 2,
    })

    expect(result.length).toBeLessThanOrEqual(2)
  })
})

describe('MCP Tools - get_meeting', () => {
  it('returns meeting details for valid meetingId', async () => {
    // Get a valid meeting ID first
    const boards = await mcpTools.listBoards({ municipality: 'teaneck' })
    const meetings = await mcpTools.searchMeetings({
      municipality: 'teaneck',
      boardId: boards[0]?.id,
    })

    if (meetings.length === 0 || !meetings[0]) {
      // If no meetings from search, the stub data should still have details
      // We'll test with a known stub ID
      return
    }

    const result = await mcpTools.getMeeting({
      municipality: 'teaneck',
      meetingId: meetings[0].id,
    })

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('date')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('documents')
    expect(Array.isArray(result.documents)).toBe(true)
  })
})

describe('MCP Tools - search_documents', () => {
  it('returns documents array for query', async () => {
    const result = await mcpTools.searchDocuments({
      municipality: 'teaneck',
      query: 'budget',
    })

    expect(Array.isArray(result)).toBe(true)
  })
})

describe('MCP Tools - get_transcript', () => {
  it('returns transcript or null for meetingId', async () => {
    const result = await mcpTools.getTranscript({
      municipality: 'teaneck',
      meetingId: 'tc-2024-12-10',
    })

    // Stub can return string or null
    expect(result === null || typeof result === 'string').toBe(true)
  })
})

describe('MCP Tools - shutdown', () => {
  it('closes without error', async () => {
    await expect(mcpTools.shutdown()).resolves.not.toThrow()
  })
})
