/**
 * Mastra Configuration
 *
 * Storage, memory, and agent configuration for the research agent.
 * Includes MCP tools for government records access.
 */

import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { MCPClient } from '@mastra/mcp'

/**
 * Storage - LibSQL (SQLite-compatible)
 *
 * Dev: file:./mastra.db
 * Prod: Can use Turso or any LibSQL URL
 */
const storageUrl = process.env.MASTRA_DATABASE_URL || 'file:./mastra.db'

export const storage = new LibSQLStore({
  url: storageUrl,
})

/**
 * Memory - conversation history with semantic recall
 */
export const memory = new Memory({
  storage,
  options: {
    lastMessages: 20,
  },
})

/**
 * MCP Client - connects to government-records MCP server
 */
export const mcpClient = new MCPClient({
  servers: {
    'government-records': {
      command: 'pnpm',
      args: ['--filter', '@teaneck/agents', 'mcp:serve'],
    },
  },
})

/**
 * Agent instructions - include tool usage guidance
 */
const AGENT_INSTRUCTIONS = `You are a government records research assistant for Teaneck, NJ.

You help users find information about:
- Township Council meetings
- Planning Board and Zoning Board decisions
- Board of Education meetings
- Other municipal board activities

## Available Tools

You have access to the following tools for researching government records:

- **list_boards**: Get all boards/committees. Use this first to see what boards exist.
- **search_meetings**: Find meetings by board, date, or topic.
- **get_meeting**: Get full details for a specific meeting (agenda, minutes, video).
- **search_documents**: Search across agendas, minutes, and resolutions.
- **get_transcript**: Get video transcript with timestamps.
- **search_by_topic**: Cross-reference search across all content types.

## Guidelines

1. Always use tools to find accurate information - don't make up meeting dates or details.
2. When asked about boards, use list_boards first.
3. When asked about meetings, use search_meetings with appropriate filters.
4. Cite your sources with meeting names and dates.
5. If you don't have information, say so clearly.
6. The municipality is always "teaneck" for tool calls.`

/**
 * Research Agent - lazy initialization with MCP tools
 *
 * Use getResearchAgent() to get an initialized agent instance.
 */
let _researchAgent: Agent | null = null

export async function getResearchAgent(): Promise<Agent> {
  if (!_researchAgent) {
    // Get tools from MCP server
    const toolsets = await mcpClient.getToolsets()

    _researchAgent = new Agent({
      name: 'government-records-agent',
      instructions: AGENT_INSTRUCTIONS,
      model: 'anthropic/claude-sonnet-4-20250514',
      memory,
    })

    // Store toolsets for use in generate calls
    ;(_researchAgent as Agent & { _toolsets: typeof toolsets })._toolsets = toolsets
  }
  return _researchAgent
}

/**
 * Get MCP toolsets for use with agent.generate()
 */
export async function getMcpToolsets() {
  return mcpClient.getToolsets()
}

/**
 * Legacy export for backwards compatibility
 * Note: This agent won't have MCP tools attached.
 * Use getResearchAgent() for full functionality.
 */
export const researchAgent = new Agent({
  name: 'government-records-agent',
  instructions: AGENT_INSTRUCTIONS,
  model: 'anthropic/claude-sonnet-4-20250514',
  memory,
})
