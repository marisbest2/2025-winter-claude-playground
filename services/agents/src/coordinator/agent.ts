/**
 * Mastra Agent
 *
 * The main coordinator agent that orchestrates deep research.
 * Uses Mastra for:
 * - Multi-turn conversation memory
 * - Tool orchestration via MCP
 * - Response generation with Claude
 */

import { deepResearch } from '../research'

// TODO: Import from @mastra/core once installed
// import { Agent } from '@mastra/core/agent'
// import { Memory } from '@mastra/memory'
// import { PostgresStore } from '@mastra/pg'

export interface AgentResponse {
  answer: string
  threadId: string
  toolsUsed: string[]
  sources: Array<{ title: string; url?: string }>
}

/**
 * Ask a question about government records
 *
 * This is the main entry point for the deep research agent.
 */
export async function askQuestion(
  question: string,
  options?: {
    threadId?: string
    userId?: string
    municipality?: string
  }
): Promise<AgentResponse> {
  const municipality = options?.municipality ?? 'teaneck'
  const threadId = options?.threadId ?? `thread-${Date.now()}`

  console.log(`[Agent] askQuestion("${question}")`)
  console.log(`  Municipality: ${municipality}`)
  console.log(`  Thread: ${threadId}`)

  // TODO: Replace with Mastra agent once installed
  // For now, use the deep research pipeline directly

  const result = await deepResearch(question, municipality)

  return {
    answer: result.answer,
    threadId,
    toolsUsed: [], // TODO: Track from MCP calls
    sources: result.sources.map(s => ({ title: s.title, url: s.url })),
  }
}

/**
 * Create a configured Mastra agent
 *
 * TODO: Implement once @mastra/core is installed
 */
export async function createAgent() {
  console.log(`[Agent] createAgent() - stub, waiting for Mastra installation`)

  // TODO: Return configured Agent instance
  // See implementation plan in .claude/plans/tingly-petting-snail.md

  return null
}
