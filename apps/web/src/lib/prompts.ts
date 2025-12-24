import type { Board, Meeting, MeetingDocument } from '@teaneck/agents'

export interface MeetingData {
  boards: Board[]
  meetings: Meeting[]
  documents?: MeetingDocument[]
}

export function buildMeetingQAPrompt(
  question: string,
  data: MeetingData
): string {
  return `You are an assistant for Teaneck Township government meetings. Answer questions about meetings, boards, committees, and government activities based on the provided data.

AVAILABLE DATA:

Boards/Committees:
${formatBoards(data.boards)}

Recent Meetings:
${formatMeetings(data.meetings)}

${data.documents ? `Documents:\n${formatDocuments(data.documents)}` : ''}

USER QUESTION: ${question}

INSTRUCTIONS:
- Answer the question based ONLY on the provided data above
- If you don't have enough information to answer fully, say so clearly
- Keep answers concise but informative (2-4 paragraphs)
- Include relevant dates, board names, and document links when applicable
- Format your answer in markdown for readability
- If the user asks about upcoming meetings or future events, note that you only have access to historical data

ANSWER:`
}

function formatBoards(boards: Board[]): string {
  if (!boards || boards.length === 0) {
    return 'No board data available.'
  }
  return boards.map((b, i) => `${i + 1}. ${b.name} (ID: ${b.id})`).join('\n')
}

function formatMeetings(meetings: Meeting[]): string {
  if (!meetings || meetings.length === 0) {
    return 'No meeting data available.'
  }
  return meetings
    .slice(0, 20) // Limit to 20 most recent to avoid token overflow
    .map(
      (m, i) =>
        `${i + 1}. ${m.date}: ${m.title}${m.boardId ? ` (Board ID: ${m.boardId})` : ''}`
    )
    .join('\n')
}

function formatDocuments(documents: MeetingDocument[]): string {
  if (!documents || documents.length === 0) {
    return 'No documents available.'
  }
  return documents
    .map((d, i) => `${i + 1}. ${d.type}: ${d.title} - ${d.url}`)
    .join('\n')
}
