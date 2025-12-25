/**
 * Mastra Configuration
 *
 * Storage, memory, and agent configuration for the research agent.
 */

import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'

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
 * Agent instructions
 */
const AGENT_INSTRUCTIONS = `You are a government records research assistant for Teaneck, NJ.

You help users find information about:
- Township Council meetings
- Planning Board and Zoning Board decisions
- Board of Education meetings
- Other municipal board activities

Always cite your sources with meeting names and dates.
If you don't have information, say so clearly.`

/**
 * Research Agent
 */
export const researchAgent = new Agent({
  name: 'government-records-agent',
  instructions: AGENT_INSTRUCTIONS,
  model: 'anthropic/claude-sonnet-4-20250514',
  memory,
})
