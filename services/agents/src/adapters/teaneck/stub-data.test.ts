/**
 * Stub Data Tests
 *
 * Verify that stub data is realistic and correctly structured.
 */

import { describe, it, expect } from 'vitest'
import {
  STUB_BOARDS,
  STUB_MEETINGS,
  STUB_MEETING_DETAILS,
  STUB_TRANSCRIPTS,
} from './stub-data'

describe('STUB_BOARDS', () => {
  it('contains at least 5 boards', () => {
    expect(STUB_BOARDS.length).toBeGreaterThanOrEqual(5)
  })

  it('includes Township Council', () => {
    const council = STUB_BOARDS.find(b => b.name === 'Township Council')
    expect(council).toBeDefined()
    expect(council?.jurisdiction).toBe('municipal')
  })

  it('includes Board of Education with boe jurisdiction', () => {
    const boe = STUB_BOARDS.find(b => b.name === 'Board of Education')
    expect(boe).toBeDefined()
    expect(boe?.jurisdiction).toBe('boe')
  })

  it('all boards have required fields', () => {
    for (const board of STUB_BOARDS) {
      expect(board.id).toBeTruthy()
      expect(board.name).toBeTruthy()
      expect(['municipal', 'boe', 'county', 'state']).toContain(board.jurisdiction)
    }
  })
})

describe('STUB_MEETINGS', () => {
  it('contains at least 10 meetings', () => {
    expect(STUB_MEETINGS.length).toBeGreaterThanOrEqual(10)
  })

  it('all meetings have required fields', () => {
    for (const meeting of STUB_MEETINGS) {
      expect(meeting.id).toBeTruthy()
      expect(meeting.date).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
      expect(meeting.title).toBeTruthy()
      expect(meeting.boardId).toBeTruthy()
    }
  })

  it('meetings reference valid board IDs', () => {
    const boardIds = new Set(STUB_BOARDS.map(b => b.id))
    for (const meeting of STUB_MEETINGS) {
      expect(boardIds.has(meeting.boardId)).toBe(true)
    }
  })

  it('has meetings for multiple boards', () => {
    const uniqueBoardIds = new Set(STUB_MEETINGS.map(m => m.boardId))
    expect(uniqueBoardIds.size).toBeGreaterThanOrEqual(3)
  })
})

describe('STUB_MEETING_DETAILS', () => {
  it('contains details for at least 5 meetings', () => {
    expect(Object.keys(STUB_MEETING_DETAILS).length).toBeGreaterThanOrEqual(5)
  })

  it('meeting details have documents array', () => {
    for (const [_id, details] of Object.entries(STUB_MEETING_DETAILS)) {
      expect(Array.isArray(details.documents)).toBe(true)
      expect(details.documents.length).toBeGreaterThan(0)
    }
  })

  it('documents have valid types', () => {
    const validTypes = ['agenda', 'minutes', 'video', 'transcript']
    for (const details of Object.values(STUB_MEETING_DETAILS)) {
      for (const doc of details.documents) {
        expect(validTypes).toContain(doc.type)
        expect(doc.url).toBeTruthy()
        expect(doc.title).toBeTruthy()
      }
    }
  })

  it('at least one meeting has videoUrl', () => {
    const hasVideo = Object.values(STUB_MEETING_DETAILS).some(d => d.videoUrl)
    expect(hasVideo).toBe(true)
  })
})

describe('STUB_TRANSCRIPTS', () => {
  it('contains at least one transcript', () => {
    expect(Object.keys(STUB_TRANSCRIPTS).length).toBeGreaterThanOrEqual(1)
  })

  it('transcripts have timestamp format', () => {
    for (const transcript of Object.values(STUB_TRANSCRIPTS)) {
      expect(transcript).toMatch(/\[\d{2}:\d{2}:\d{2}\]/)
    }
  })
})
