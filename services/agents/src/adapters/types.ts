/**
 * Adapter Types
 *
 * These types define the interface for municipality-specific adapters.
 * Each adapter implements these interfaces to provide a consistent API
 * regardless of the underlying data source (IQM2, Granicus, Legistar, etc.)
 */

export interface Board {
  id: string
  name: string
  jurisdiction?: 'municipal' | 'boe' | 'county' | 'state'
}

export interface Meeting {
  id: string
  date: string
  title: string
  boardId: string
  boardName?: string
}

export interface MeetingDocument {
  type: 'agenda' | 'minutes' | 'video' | 'transcript'
  url: string
  title: string
}

export interface MeetingDetails extends Meeting {
  documents: MeetingDocument[]
  videoUrl?: string
  transcriptUrl?: string
}

/**
 * Municipality Adapter Interface
 *
 * Each municipality implements this interface to provide access to
 * their specific meeting portal and video platform.
 */
export interface MunicipalityAdapter {
  readonly name: string
  readonly jurisdiction: string

  // Lifecycle
  init(): Promise<void>
  close(): Promise<void>

  // Data access
  listBoards(): Promise<Board[]>
  listMeetings(
    boardId: string,
    options?: { limit?: number }
  ): Promise<Meeting[]>
  getMeetingDetails(meetingId: string): Promise<MeetingDetails>
  getTranscript(meetingId: string): Promise<string | null>

  // Search
  searchMeetings(query: string): Promise<Meeting[]>
  searchDocuments(query: string): Promise<MeetingDocument[]>
}
