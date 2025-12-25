/**
 * Government Records MCP Server
 *
 * A Model Context Protocol server that exposes government records tools.
 * This server can be run as a standalone process (stdio) or embedded in a web server.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  listBoards,
  searchMeetings,
  getMeeting,
  searchDocuments,
  getTranscript,
  shutdown,
} from './government-records'

const VERSION = '0.1.0'

/**
 * Create and configure the MCP server with government records tools
 */
export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'government-records',
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
      instructions: `
This server provides tools for accessing government meeting records.
Use these tools to:
- List boards/committees in a municipality
- Search for meetings by board, date, or topic
- Get meeting details including agenda, minutes, and video links
- Search documents across all meetings
- Get video transcripts (when available)

Currently supported municipalities: teaneck
      `.trim(),
    }
  )

  // Register list_boards tool
  server.registerTool(
    'list_boards',
    {
      title: 'List Boards',
      description:
        'Get all boards/committees for a municipality. Optionally filter by jurisdiction type (municipal, boe, county, state).',
      inputSchema: {
        municipality: z
          .string()
          .describe('Municipality identifier (e.g., "teaneck")'),
        jurisdiction: z
          .enum(['municipal', 'boe', 'county', 'state'])
          .optional()
          .describe('Filter by jurisdiction type'),
      },
    },
    async args => {
      const result = await listBoards({
        municipality: args.municipality,
        jurisdiction: args.jurisdiction,
      })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    }
  )

  // Register search_meetings tool
  server.registerTool(
    'search_meetings',
    {
      title: 'Search Meetings',
      description:
        'Find meetings by board, query, or both. Returns meeting IDs, dates, and titles.',
      inputSchema: {
        municipality: z
          .string()
          .describe('Municipality identifier (e.g., "teaneck")'),
        boardId: z.string().optional().describe('Filter by board ID'),
        query: z
          .string()
          .optional()
          .describe('Search query for meeting topics'),
        limit: z
          .number()
          .optional()
          .default(20)
          .describe('Maximum number of results (default: 20)'),
      },
    },
    async args => {
      const result = await searchMeetings({
        municipality: args.municipality,
        boardId: args.boardId,
        query: args.query,
        limit: args.limit,
      })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    }
  )

  // Register get_meeting tool
  server.registerTool(
    'get_meeting',
    {
      title: 'Get Meeting Details',
      description:
        'Get full meeting details including agenda, minutes, and video links.',
      inputSchema: {
        municipality: z
          .string()
          .describe('Municipality identifier (e.g., "teaneck")'),
        meetingId: z.string().describe('Meeting ID'),
      },
    },
    async args => {
      const result = await getMeeting({
        municipality: args.municipality,
        meetingId: args.meetingId,
      })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    }
  )

  // Register search_documents tool
  server.registerTool(
    'search_documents',
    {
      title: 'Search Documents',
      description:
        'Search across agendas, minutes, and resolutions. Returns matching documents with links.',
      inputSchema: {
        municipality: z
          .string()
          .describe('Municipality identifier (e.g., "teaneck")'),
        query: z.string().describe('Search query'),
      },
    },
    async args => {
      const result = await searchDocuments({
        municipality: args.municipality,
        query: args.query,
      })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    }
  )

  // Register get_transcript tool
  server.registerTool(
    'get_transcript',
    {
      title: 'Get Meeting Transcript',
      description:
        'Get video transcript with timestamps for a meeting. Returns null if no transcript is available.',
      inputSchema: {
        municipality: z
          .string()
          .describe('Municipality identifier (e.g., "teaneck")'),
        meetingId: z.string().describe('Meeting ID'),
      },
    },
    async args => {
      const result = await getTranscript({
        municipality: args.municipality,
        meetingId: args.meetingId,
      })
      return {
        content: [
          {
            type: 'text',
            text:
              result !== null
                ? result
                : 'No transcript available for this meeting.',
          },
        ],
      }
    }
  )

  return server
}

/**
 * Run the MCP server with stdio transport
 * This is the main entry point for running as a standalone process
 */
export async function runStdioServer(): Promise<void> {
  const server = createMcpServer()
  const transport = new StdioServerTransport()

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('[MCP Server] Received SIGINT, shutting down...')
    await shutdown()
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.error('[MCP Server] Received SIGTERM, shutting down...')
    await shutdown()
    await server.close()
    process.exit(0)
  })

  console.error(`[MCP Server] Starting government-records server v${VERSION}`)
  await server.connect(transport)
  console.error('[MCP Server] Server connected and ready')
}

// Run server if this file is executed directly
const isMainModule =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') ||
    process.argv[1].endsWith('server.js'))

if (isMainModule) {
  runStdioServer().catch(err => {
    console.error('[MCP Server] Fatal error:', err)
    process.exit(1)
  })
}
