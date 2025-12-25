/**
 * Teaneck Municipality Adapter
 *
 * Implements the MunicipalityAdapter interface for Teaneck Township, NJ.
 * Data sources:
 * - IQM2 portal for meetings, agendas, minutes
 * - YouTube for video recordings and transcripts
 *
 * Currently returns stub data. Real implementation in Milestone 3.
 */

import type {
  MunicipalityAdapter,
  Board,
  Meeting,
  MeetingDetails,
  MeetingDocument,
} from '../types'

import {
  STUB_BOARDS,
  STUB_MEETING_DETAILS,
  STUB_TRANSCRIPTS,
  getMeetingsForBoard,
  searchMeetingsByQuery,
  searchDocumentsByQuery,
} from './stub-data'

const IQM2_BASE_URL = 'https://teanecktownnj.iqm2.com/Citizens'
const YOUTUBE_CHANNEL = '@TeaneckNJ07666'

export class TeaneckAdapter implements MunicipalityAdapter {
  readonly name = 'Teaneck Township'
  readonly jurisdiction = 'municipal'

  async init(): Promise<void> {
    console.log(`[TeaneckAdapter] Initializing (stub mode)...`)
    console.log(`  IQM2 Portal: ${IQM2_BASE_URL}`)
    console.log(`  YouTube: ${YOUTUBE_CHANNEL}`)
  }

  async close(): Promise<void> {
    console.log(`[TeaneckAdapter] Closing...`)
  }

  async listBoards(): Promise<Board[]> {
    console.log(`[TeaneckAdapter] listBoards()`)
    return STUB_BOARDS
  }

  async listMeetings(
    boardId: string,
    options?: { limit?: number }
  ): Promise<Meeting[]> {
    console.log(`[TeaneckAdapter] listMeetings(${boardId}, ${JSON.stringify(options)})`)
    return getMeetingsForBoard(boardId, options)
  }

  async getMeetingDetails(meetingId: string): Promise<MeetingDetails> {
    console.log(`[TeaneckAdapter] getMeetingDetails(${meetingId})`)
    const details = STUB_MEETING_DETAILS[meetingId]
    if (details) {
      return details
    }
    // Return minimal details for unknown meeting IDs
    return {
      id: meetingId,
      date: '',
      title: 'Meeting not found',
      boardId: '',
      documents: [],
    }
  }

  async getTranscript(meetingId: string): Promise<string | null> {
    console.log(`[TeaneckAdapter] getTranscript(${meetingId})`)
    return STUB_TRANSCRIPTS[meetingId] || null
  }

  async searchMeetings(query: string): Promise<Meeting[]> {
    console.log(`[TeaneckAdapter] searchMeetings(${query})`)
    return searchMeetingsByQuery(query)
  }

  async searchDocuments(query: string): Promise<MeetingDocument[]> {
    console.log(`[TeaneckAdapter] searchDocuments(${query})`)
    return searchDocumentsByQuery(query)
  }
}

export function createTeaneckAdapter(): MunicipalityAdapter {
  return new TeaneckAdapter()
}
