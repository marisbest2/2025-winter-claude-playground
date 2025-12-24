export interface Board {
  id: string
  name: string
}

export interface Meeting {
  id: string
  date: string
  title: string
  boardId?: string
}

export interface MeetingDocument {
  type: 'agenda' | 'minutes' | 'video'
  url: string
  title: string
}

export interface MeetingSystemScraper {
  readonly systemType: string

  init(): Promise<void>
  close(): Promise<void>
  canConnect(): Promise<boolean>
  listBoards(): Promise<Board[]>
  listMeetings(boardId: string): Promise<Meeting[]>
  getMeetingDocuments(meetingId: string): Promise<MeetingDocument[]>
}
