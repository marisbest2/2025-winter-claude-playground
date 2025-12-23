// Shared types across all services
export interface Meeting {
  id: string
  title: string
  date: Date
  type: string
}

export interface MeetingAgenda {
  meetingId: string
  content: string
  url: string
}

export interface MeetingMinutes {
  meetingId: string
  content: string
  url: string
}

export interface MeetingSummary {
  meetingId: string
  summary: string
  keyPoints: string[]
}
