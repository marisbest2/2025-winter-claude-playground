/**
 * Government Records MCP Server
 *
 * Domain-driven MCP tools for accessing government records.
 * Tools are designed around user mental models (boards, meetings, documents)
 * not data sources (IQM2, YouTube, etc.)
 *
 * This server delegates to municipality adapters for actual data access.
 */

import { ADAPTERS, type MunicipalityAdapter } from '../adapters'

// Active adapters cache
const adapters: Map<string, MunicipalityAdapter> = new Map()

/**
 * Initialize an adapter for a municipality
 */
async function getAdapter(municipality: string): Promise<MunicipalityAdapter> {
  if (!adapters.has(municipality)) {
    const factory = ADAPTERS[municipality as keyof typeof ADAPTERS]
    if (!factory) {
      const available = Object.keys(ADAPTERS).join(', ')
      throw new Error(
        `Unknown municipality: ${municipality}. Available municipalities: ${available}`
      )
    }
    const adapter = await factory()
    await adapter.init()
    adapters.set(municipality, adapter)
  }
  return adapters.get(municipality)!
}

/**
 * MCP Tool: list_boards
 *
 * Get all boards/committees for a municipality.
 * Optionally filter by jurisdiction type.
 */
export async function listBoards(params: {
  municipality: string
  jurisdiction?: 'municipal' | 'boe' | 'county' | 'state'
}) {
  const debugEnabled = process.env.DEBUG === 'true'
  if (debugEnabled) {
    console.error(`[MCP] list_boards(${JSON.stringify(params)})`)
  }
  const adapter = await getAdapter(params.municipality)
  const boards = await adapter.listBoards()

  if (params.jurisdiction) {
    return boards.filter(b => b.jurisdiction === params.jurisdiction)
  }
  return boards
}

/**
 * MCP Tool: search_meetings
 *
 * Find meetings by board, date range, or topic.
 * Returns all recent meetings if no filters specified.
 */
export async function searchMeetings(params: {
  municipality: string
  boardId?: string
  query?: string
  limit?: number
}) {
  const debugEnabled = process.env.DEBUG === 'true'
  if (debugEnabled) {
    console.error(`[MCP] search_meetings(${JSON.stringify(params)})`)
  }
  const adapter = await getAdapter(params.municipality)

  if (params.query) {
    return adapter.searchMeetings(params.query)
  }

  if (params.boardId) {
    return adapter.listMeetings(params.boardId, { limit: params.limit })
  }

  // No filters specified - return recent meetings across all boards
  const boards = await adapter.listBoards()
  const allMeetings = await Promise.all(
    boards.slice(0, 3).map(board => adapter.listMeetings(board.id, { limit: 5 }))
  )
  return allMeetings.flat().slice(0, params.limit || 10)
}

/**
 * MCP Tool: get_meeting
 *
 * Get full meeting details including agenda, minutes, and video links.
 */
export async function getMeeting(params: {
  municipality: string
  meetingId: string
}) {
  const debugEnabled = process.env.DEBUG === 'true'
  if (debugEnabled) {
    console.error(`[MCP] get_meeting(${JSON.stringify(params)})`)
  }
  const adapter = await getAdapter(params.municipality)
  return adapter.getMeetingDetails(params.meetingId)
}

/**
 * MCP Tool: search_documents
 *
 * Search across agendas, minutes, and resolutions.
 */
export async function searchDocuments(params: {
  municipality: string
  query: string
}) {
  const debugEnabled = process.env.DEBUG === 'true'
  if (debugEnabled) {
    console.error(`[MCP] search_documents(${JSON.stringify(params)})`)
  }
  const adapter = await getAdapter(params.municipality)
  return adapter.searchDocuments(params.query)
}

/**
 * MCP Tool: get_transcript
 *
 * Get video transcript with timestamps.
 */
export async function getTranscript(params: {
  municipality: string
  meetingId: string
}) {
  const debugEnabled = process.env.DEBUG === 'true'
  if (debugEnabled) {
    console.error(`[MCP] get_transcript(${JSON.stringify(params)})`)
  }
  const adapter = await getAdapter(params.municipality)
  return adapter.getTranscript(params.meetingId)
}

/**
 * Cleanup - close all adapters
 */
export async function shutdown() {
  const debugEnabled = process.env.DEBUG === 'true'
  for (const [name, adapter] of adapters) {
    if (debugEnabled) {
      console.error(`[MCP] Closing adapter: ${name}`)
    }
    await adapter.close()
  }
  adapters.clear()
}
