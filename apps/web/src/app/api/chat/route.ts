/**
 * AI SDK Chat Route
 *
 * Provides streaming chat responses using AI SDK with Anthropic.
 * Includes tool calls for government records queries.
 */

import {
  streamText,
  tool,
  zodSchema,
  convertToModelMessages,
  consumeStream,
  UIMessage,
  stepCountIs,
} from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

// Configure route
export const maxDuration = 60 // 60 seconds timeout

// Define schemas for tools
const listBoardsSchema = z.object({
  jurisdiction: z
    .enum(['municipal', 'boe', 'county', 'state'])
    .optional()
    .describe('Optional filter by jurisdiction type'),
})

const searchMeetingsSchema = z.object({
  boardId: z.string().optional().describe('Board ID to filter by'),
  query: z.string().optional().describe('Search query for meeting topics'),
  limit: z.number().optional().default(10).describe('Maximum results to return'),
})

const getMeetingSchema = z.object({
  meetingId: z.string().describe('The meeting ID to get details for'),
})

// Government records tools
const governmentTools = {
  list_boards: tool({
    description:
      'Get all boards and committees for Teaneck Township. Use this when the user asks about what boards exist.',
    inputSchema: zodSchema(listBoardsSchema),
    execute: async (input: z.infer<typeof listBoardsSchema>) => {
      const { jurisdiction } = input
      // Mock data - will be replaced with actual adapter calls
      const boards = [
        {
          id: 'council',
          name: 'Township Council',
          jurisdiction: 'municipal' as const,
        },
        {
          id: 'planning',
          name: 'Planning Board',
          jurisdiction: 'municipal' as const,
        },
        {
          id: 'zoning',
          name: 'Zoning Board of Adjustment',
          jurisdiction: 'municipal' as const,
        },
        {
          id: 'boe',
          name: 'Board of Education',
          jurisdiction: 'boe' as const,
        },
        {
          id: 'environmental',
          name: 'Environmental Commission',
          jurisdiction: 'municipal' as const,
        },
        {
          id: 'library',
          name: 'Library Board',
          jurisdiction: 'municipal' as const,
        },
      ]

      if (jurisdiction) {
        return boards.filter(b => b.jurisdiction === jurisdiction)
      }
      return boards
    },
  }),

  search_meetings: tool({
    description:
      'Search for meetings by board name, date, or topic. Use this to find specific meetings.',
    inputSchema: zodSchema(searchMeetingsSchema),
    execute: async (input: z.infer<typeof searchMeetingsSchema>) => {
      const { boardId, query, limit = 10 } = input
      // Mock data - will be replaced with actual adapter calls
      const meetings = [
        {
          id: 'mtg-1',
          date: '2024-12-15',
          title: 'Township Council Regular Meeting',
          boardId: 'council',
          boardName: 'Township Council',
        },
        {
          id: 'mtg-2',
          date: '2024-12-10',
          title: 'Planning Board Meeting',
          boardId: 'planning',
          boardName: 'Planning Board',
        },
        {
          id: 'mtg-3',
          date: '2024-12-05',
          title: 'Zoning Board of Adjustment Meeting',
          boardId: 'zoning',
          boardName: 'Zoning Board of Adjustment',
        },
        {
          id: 'mtg-4',
          date: '2024-12-01',
          title: 'Township Council Work Session',
          boardId: 'council',
          boardName: 'Township Council',
        },
      ]

      let results = meetings

      if (boardId) {
        results = results.filter(m => m.boardId === boardId)
      }

      if (query) {
        const q = query.toLowerCase()
        results = results.filter(
          m =>
            m.title.toLowerCase().includes(q) ||
            m.boardName.toLowerCase().includes(q)
        )
      }

      return results.slice(0, limit)
    },
  }),

  get_meeting: tool({
    description:
      'Get detailed information about a specific meeting including agenda and minutes.',
    inputSchema: zodSchema(getMeetingSchema),
    execute: async (input: z.infer<typeof getMeetingSchema>) => {
      const { meetingId } = input
      // Mock data
      return {
        id: meetingId,
        date: '2024-12-15',
        title: 'Township Council Regular Meeting',
        boardName: 'Township Council',
        agenda: [
          'Call to Order',
          'Roll Call',
          'Public Comments',
          'Resolution 2024-123: Budget Amendment',
          'Ordinance 2024-45: Zoning Update',
          'Adjournment',
        ],
        documents: [
          { type: 'agenda', url: 'https://example.com/agenda.pdf' },
          { type: 'minutes', url: 'https://example.com/minutes.pdf' },
        ],
        videoUrl: 'https://youtube.com/watch?v=example',
      }
    },
  }),
}

// System prompt for the agent
const SYSTEM_PROMPT = `You are a government records research assistant for Teaneck, NJ.

You help users find information about:
- Township Council meetings
- Planning Board and Zoning Board decisions
- Board of Education meetings
- Other municipal board activities

When answering questions:
1. Use the available tools to search for relevant information
2. Always cite your sources with meeting names and dates
3. If you don't have information, say so clearly
4. Be concise but thorough in your answers

Available boards include: Township Council, Planning Board, Zoning Board of Adjustment, Board of Education, Environmental Commission, and Library Board.`

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages array is required', { status: 400 })
    }

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: governmentTools,
      stopWhen: stepCountIs(5), // Allow up to 5 steps (tool calls and responses)
      abortSignal: request.signal,
    })

    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream, // needed for correct abort handling
    })
  } catch (error) {
    console.error('Error in /api/chat:', error)

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
