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
      throw new Error(`Unknown municipality: ${municipality}`)
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
  console.log(`[MCP] list_boards(${JSON.stringify(params)})`)
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
 */
export async function searchMeetings(params: {
  municipality: string
  boardId?: string
  query?: string
  limit?: number
}) {
  console.log(`[MCP] search_meetings(${JSON.stringify(params)})`)
  const adapter = await getAdapter(params.municipality)

  if (params.query) {
    return adapter.searchMeetings(params.query)
  }

  if (params.boardId) {
    return adapter.listMeetings(params.boardId, { limit: params.limit })
  }

  return []
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
  console.log(`[MCP] get_meeting(${JSON.stringify(params)})`)
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
  console.log(`[MCP] search_documents(${JSON.stringify(params)})`)
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
  console.log(`[MCP] get_transcript(${JSON.stringify(params)})`)
  const adapter = await getAdapter(params.municipality)
  return adapter.getTranscript(params.meetingId)
}

/**
 * Cleanup - close all adapters
 */
export async function shutdown() {
  for (const [name, adapter] of adapters) {
    console.log(`[MCP] Closing adapter: ${name}`)
    await adapter.close()
  }
  adapters.clear()
}
