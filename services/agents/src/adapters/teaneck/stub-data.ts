/**
 * Stub Data for Teaneck Municipality
 *
 * Realistic stub data for testing and development.
 * Based on actual Teaneck Township boards and meeting patterns.
 */

import type { Board, Meeting, MeetingDetails, MeetingDocument } from '../types'

/**
 * Teaneck Boards/Committees
 * Source: https://teanecktownnj.iqm2.com/Citizens/
 */
export const STUB_BOARDS: Board[] = [
  {
    id: 'township-council',
    name: 'Township Council',
    jurisdiction: 'municipal',
  },
  {
    id: 'planning-board',
    name: 'Planning Board',
    jurisdiction: 'municipal',
  },
  {
    id: 'zoning-board',
    name: 'Zoning Board of Adjustment',
    jurisdiction: 'municipal',
  },
  {
    id: 'board-of-education',
    name: 'Board of Education',
    jurisdiction: 'boe',
  },
  {
    id: 'environmental-commission',
    name: 'Environmental Commission',
    jurisdiction: 'municipal',
  },
  {
    id: 'library-board',
    name: 'Library Board of Trustees',
    jurisdiction: 'municipal',
  },
  {
    id: 'rent-board',
    name: 'Rent Stabilization Board',
    jurisdiction: 'municipal',
  },
  {
    id: 'historic-preservation',
    name: 'Historic Preservation Commission',
    jurisdiction: 'municipal',
  },
]

/**
 * Recent Meetings
 * ~2-3 per board with realistic dates
 */
export const STUB_MEETINGS: Meeting[] = [
  // Township Council
  {
    id: 'tc-2024-12-10',
    boardId: 'township-council',
    boardName: 'Township Council',
    date: '2024-12-10',
    title: 'Regular Meeting',
  },
  {
    id: 'tc-2024-11-26',
    boardId: 'township-council',
    boardName: 'Township Council',
    date: '2024-11-26',
    title: 'Regular Meeting',
  },
  {
    id: 'tc-2024-11-12',
    boardId: 'township-council',
    boardName: 'Township Council',
    date: '2024-11-12',
    title: 'Regular Meeting',
  },

  // Planning Board
  {
    id: 'pb-2024-12-04',
    boardId: 'planning-board',
    boardName: 'Planning Board',
    date: '2024-12-04',
    title: 'Regular Meeting',
  },
  {
    id: 'pb-2024-11-20',
    boardId: 'planning-board',
    boardName: 'Planning Board',
    date: '2024-11-20',
    title: 'Regular Meeting',
  },

  // Zoning Board
  {
    id: 'zb-2024-12-05',
    boardId: 'zoning-board',
    boardName: 'Zoning Board of Adjustment',
    date: '2024-12-05',
    title: 'Regular Meeting',
  },
  {
    id: 'zb-2024-11-07',
    boardId: 'zoning-board',
    boardName: 'Zoning Board of Adjustment',
    date: '2024-11-07',
    title: 'Regular Meeting',
  },

  // Board of Education
  {
    id: 'boe-2024-12-11',
    boardId: 'board-of-education',
    boardName: 'Board of Education',
    date: '2024-12-11',
    title: 'Regular Meeting',
  },
  {
    id: 'boe-2024-11-27',
    boardId: 'board-of-education',
    boardName: 'Board of Education',
    date: '2024-11-27',
    title: 'Regular Meeting',
  },

  // Environmental Commission
  {
    id: 'ec-2024-12-03',
    boardId: 'environmental-commission',
    boardName: 'Environmental Commission',
    date: '2024-12-03',
    title: 'Regular Meeting',
  },

  // Library Board
  {
    id: 'lb-2024-12-09',
    boardId: 'library-board',
    boardName: 'Library Board of Trustees',
    date: '2024-12-09',
    title: 'Regular Meeting',
  },

  // Rent Board
  {
    id: 'rb-2024-11-18',
    boardId: 'rent-board',
    boardName: 'Rent Stabilization Board',
    date: '2024-11-18',
    title: 'Regular Meeting',
  },
]

const IQM2_BASE = 'https://teanecktownnj.iqm2.com/Citizens/FileOpen.aspx'
const YOUTUBE_BASE = 'https://www.youtube.com/watch'

/**
 * Meeting Details with Documents
 */
export const STUB_MEETING_DETAILS: Record<string, MeetingDetails> = {
  'tc-2024-12-10': {
    id: 'tc-2024-12-10',
    boardId: 'township-council',
    boardName: 'Township Council',
    date: '2024-12-10',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2847`,
      },
      {
        type: 'minutes',
        title: 'Meeting Minutes',
        url: `${IQM2_BASE}?Type=12&ID=2848`,
      },
      {
        type: 'video',
        title: 'Video Recording',
        url: `${YOUTUBE_BASE}?v=dQw4w9WgXcQ`,
      },
    ],
    videoUrl: `${YOUTUBE_BASE}?v=dQw4w9WgXcQ`,
  },

  'tc-2024-11-26': {
    id: 'tc-2024-11-26',
    boardId: 'township-council',
    boardName: 'Township Council',
    date: '2024-11-26',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2840`,
      },
      {
        type: 'minutes',
        title: 'Meeting Minutes',
        url: `${IQM2_BASE}?Type=12&ID=2841`,
      },
    ],
    videoUrl: `${YOUTUBE_BASE}?v=abc123`,
  },

  'tc-2024-11-12': {
    id: 'tc-2024-11-12',
    boardId: 'township-council',
    boardName: 'Township Council',
    date: '2024-11-12',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2835`,
      },
    ],
  },

  'pb-2024-12-04': {
    id: 'pb-2024-12-04',
    boardId: 'planning-board',
    boardName: 'Planning Board',
    date: '2024-12-04',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2850`,
      },
      {
        type: 'video',
        title: 'Video Recording',
        url: `${YOUTUBE_BASE}?v=planning123`,
      },
    ],
    videoUrl: `${YOUTUBE_BASE}?v=planning123`,
  },

  'pb-2024-11-20': {
    id: 'pb-2024-11-20',
    boardId: 'planning-board',
    boardName: 'Planning Board',
    date: '2024-11-20',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2842`,
      },
      {
        type: 'minutes',
        title: 'Meeting Minutes',
        url: `${IQM2_BASE}?Type=12&ID=2843`,
      },
    ],
  },

  'zb-2024-12-05': {
    id: 'zb-2024-12-05',
    boardId: 'zoning-board',
    boardName: 'Zoning Board of Adjustment',
    date: '2024-12-05',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2851`,
      },
    ],
  },

  'zb-2024-11-07': {
    id: 'zb-2024-11-07',
    boardId: 'zoning-board',
    boardName: 'Zoning Board of Adjustment',
    date: '2024-11-07',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2830`,
      },
      {
        type: 'minutes',
        title: 'Meeting Minutes',
        url: `${IQM2_BASE}?Type=12&ID=2831`,
      },
    ],
  },

  'boe-2024-12-11': {
    id: 'boe-2024-12-11',
    boardId: 'board-of-education',
    boardName: 'Board of Education',
    date: '2024-12-11',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2855`,
      },
      {
        type: 'video',
        title: 'Video Recording',
        url: `${YOUTUBE_BASE}?v=boe123`,
      },
    ],
    videoUrl: `${YOUTUBE_BASE}?v=boe123`,
  },

  'boe-2024-11-27': {
    id: 'boe-2024-11-27',
    boardId: 'board-of-education',
    boardName: 'Board of Education',
    date: '2024-11-27',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2844`,
      },
    ],
  },

  'ec-2024-12-03': {
    id: 'ec-2024-12-03',
    boardId: 'environmental-commission',
    boardName: 'Environmental Commission',
    date: '2024-12-03',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2849`,
      },
    ],
  },

  'lb-2024-12-09': {
    id: 'lb-2024-12-09',
    boardId: 'library-board',
    boardName: 'Library Board of Trustees',
    date: '2024-12-09',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2853`,
      },
    ],
  },

  'rb-2024-11-18': {
    id: 'rb-2024-11-18',
    boardId: 'rent-board',
    boardName: 'Rent Stabilization Board',
    date: '2024-11-18',
    title: 'Regular Meeting',
    documents: [
      {
        type: 'agenda',
        title: 'Meeting Agenda',
        url: `${IQM2_BASE}?Type=14&ID=2838`,
      },
      {
        type: 'minutes',
        title: 'Meeting Minutes',
        url: `${IQM2_BASE}?Type=12&ID=2839`,
      },
    ],
  },
}

/**
 * Sample Transcripts
 */
export const STUB_TRANSCRIPTS: Record<string, string> = {
  'tc-2024-12-10': `[00:00:00] Mayor Pagan: I call this meeting of the Teaneck Township Council to order.
[00:00:15] Clerk: Roll call. Council Member Stern?
[00:00:18] Council Member Stern: Present.
[00:00:20] Clerk: Council Member Schwartz?
[00:00:22] Council Member Schwartz: Present.
[00:05:30] Mayor Pagan: Moving on to the consent agenda. Items 1 through 5.
[00:10:45] Public Comment: Resident speaking about traffic concerns on Cedar Lane.
[00:25:00] Discussion: Budget amendments for Q1 2025.
[00:45:00] Mayor Pagan: We will now open the public comment period.
[01:15:00] Mayor Pagan: Hearing no further comments, this meeting is adjourned.`,

  'pb-2024-12-04': `[00:00:00] Chair: Good evening. The Planning Board meeting is now in session.
[00:02:00] Application PB-2024-15: Variance request for 123 Main Street.
[00:15:00] Applicant presents plans for residential development.
[00:35:00] Board discussion on setback requirements.
[00:55:00] Public hearing opens for comments.
[01:10:00] Board votes to approve application with conditions.`,

  'boe-2024-12-11': `[00:00:00] President: The Board of Education meeting is called to order.
[00:05:00] Superintendent's report on district performance metrics.
[00:20:00] Discussion of proposed curriculum changes for 2025-2026.
[00:40:00] Budget presentation for capital improvements.
[01:00:00] Public comment period.
[01:25:00] President: Meeting adjourned.`,
}

/**
 * Helper: Get meetings for a specific board
 */
export function getMeetingsForBoard(
  boardId: string,
  options?: { limit?: number }
): Meeting[] {
  const meetings = STUB_MEETINGS.filter(m => m.boardId === boardId)
  if (options?.limit) {
    return meetings.slice(0, options.limit)
  }
  return meetings
}

/**
 * Helper: Search meetings by query
 */
export function searchMeetingsByQuery(query: string): Meeting[] {
  const lowerQuery = query.toLowerCase()
  return STUB_MEETINGS.filter(
    m =>
      m.title.toLowerCase().includes(lowerQuery) ||
      m.boardName?.toLowerCase().includes(lowerQuery) ||
      m.boardId.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Helper: Search documents by query
 */
export function searchDocumentsByQuery(query: string): MeetingDocument[] {
  const lowerQuery = query.toLowerCase()
  const results: MeetingDocument[] = []

  for (const details of Object.values(STUB_MEETING_DETAILS)) {
    // Check if meeting title/board matches query
    if (
      details.title.toLowerCase().includes(lowerQuery) ||
      details.boardName?.toLowerCase().includes(lowerQuery)
    ) {
      results.push(...details.documents)
    }
  }

  return results
}
