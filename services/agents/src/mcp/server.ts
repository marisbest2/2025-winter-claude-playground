#!/usr/bin/env node
/**
 * Government Records MCP Server
 *
 * Exposes government records tools via Model Context Protocol (stdio transport).
 * This server can be used by any MCP-compatible client (Mastra, Claude Desktop, etc.)
 *
 * Usage:
 *   pnpm --filter @teaneck/agents mcp:serve
 *
 * Or via .mcp.json config:
 *   {
 *     "mcpServers": {
 *       "government-records": {
 *         "type": "stdio",
 *         "command": "pnpm",
 *         "args": ["--filter", "@teaneck/agents", "mcp:serve"]
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import * as tools from './government-records'

/**
 * Tool definitions for MCP
 */
const TOOL_DEFINITIONS = [
  {
    name: 'list_boards',
    description:
      'Get all boards and committees for a municipality. Optionally filter by jurisdiction type (municipal, boe, county, state).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        municipality: {
          type: 'string',
          description: 'Municipality name (e.g., "teaneck")',
        },
        jurisdiction: {
          type: 'string',
          enum: ['municipal', 'boe', 'county', 'state'],
          description: 'Filter by jurisdiction type',
        },
      },
      required: ['municipality'],
    },
  },
  {
    name: 'search_meetings',
    description:
      'Search for meetings by board, date range, or topic. Returns list of meetings matching the criteria.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        municipality: {
          type: 'string',
          description: 'Municipality name (e.g., "teaneck")',
        },
        boardId: {
          type: 'string',
          description: 'Filter by board ID (e.g., "township-council")',
        },
        query: {
          type: 'string',
          description: 'Search query for meeting title or content',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
        },
      },
      required: ['municipality'],
    },
  },
  {
    name: 'get_meeting',
    description:
      'Get full details for a specific meeting including agenda, minutes, and video links.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        municipality: {
          type: 'string',
          description: 'Municipality name (e.g., "teaneck")',
        },
        meetingId: {
          type: 'string',
          description: 'Meeting ID (e.g., "tc-2024-12-10")',
        },
      },
      required: ['municipality', 'meetingId'],
    },
  },
  {
    name: 'search_documents',
    description:
      'Search across agendas, minutes, and resolutions for a municipality.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        municipality: {
          type: 'string',
          description: 'Municipality name (e.g., "teaneck")',
        },
        query: {
          type: 'string',
          description: 'Search query',
        },
      },
      required: ['municipality', 'query'],
    },
  },
  {
    name: 'get_transcript',
    description:
      'Get video transcript with timestamps for a meeting. Returns null if no transcript available.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        municipality: {
          type: 'string',
          description: 'Municipality name (e.g., "teaneck")',
        },
        meetingId: {
          type: 'string',
          description: 'Meeting ID (e.g., "tc-2024-12-10")',
        },
      },
      required: ['municipality', 'meetingId'],
    },
  },
  {
    name: 'search_by_topic',
    description:
      'Cross-reference search across all content types (meetings, documents, transcripts) for a topic.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        municipality: {
          type: 'string',
          description: 'Municipality name (e.g., "teaneck")',
        },
        topic: {
          type: 'string',
          description: 'Topic to search for',
        },
      },
      required: ['municipality', 'topic'],
    },
  },
]

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'government-records',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOL_DEFINITIONS,
    }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params

    try {
      let result: unknown

      switch (name) {
        case 'list_boards':
          result = await tools.listBoards(args as Parameters<typeof tools.listBoards>[0])
          break

        case 'search_meetings':
          result = await tools.searchMeetings(args as Parameters<typeof tools.searchMeetings>[0])
          break

        case 'get_meeting':
          result = await tools.getMeeting(args as Parameters<typeof tools.getMeeting>[0])
          break

        case 'search_documents':
          result = await tools.searchDocuments(args as Parameters<typeof tools.searchDocuments>[0])
          break

        case 'get_transcript':
          result = await tools.getTranscript(args as Parameters<typeof tools.getTranscript>[0])
          break

        case 'search_by_topic':
          // search_by_topic combines meetings and documents search
          const topicArgs = args as { municipality: string; topic: string }
          const [meetings, documents] = await Promise.all([
            tools.searchMeetings({ municipality: topicArgs.municipality, query: topicArgs.topic }),
            tools.searchDocuments({ municipality: topicArgs.municipality, query: topicArgs.topic }),
          ])
          result = { meetings, documents }
          break

        default:
          throw new Error(`Unknown tool: ${name}`)
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      }
    }
  })

  return server
}

/**
 * Main entry point
 */
async function main() {
  const server = createServer()
  const transport = new StdioServerTransport()

  // Handle shutdown
  process.on('SIGINT', async () => {
    console.error('[MCP Server] Shutting down...')
    await tools.shutdown()
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.error('[MCP Server] Shutting down...')
    await tools.shutdown()
    await server.close()
    process.exit(0)
  })

  console.error('[MCP Server] Starting government-records server...')
  await server.connect(transport)
  console.error('[MCP Server] Server connected and ready')
}

main().catch(error => {
  console.error('[MCP Server] Fatal error:', error)
  process.exit(1)
})
