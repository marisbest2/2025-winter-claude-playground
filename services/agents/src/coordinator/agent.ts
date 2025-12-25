/**
 * Mastra Agent
 *
 * The main coordinator agent that orchestrates deep research.
 * Uses Mastra for:
 * - Multi-turn conversation memory
 * - Tool orchestration via MCP
 * - Response generation with Claude
 */

import { researchAgent, memory } from './mastra'

export interface AgentResponse {
  answer: string
  threadId: string
  toolsUsed: string[]
  sources: Array<{ title: string; url?: string }>
}

export interface StreamingResponse {
  stream: AsyncIterable<string>
  threadId: string
}

/**
 * Ask a question about government records
 */
export async function askQuestion(
  question: string,
  options?: {
    threadId?: string
    resourceId?: string
  }
): Promise<AgentResponse> {
  const threadId = options?.threadId ?? generateThreadId()
  const resourceId = options?.resourceId ?? 'default-user'

  const response = await researchAgent.generate(question, {
    threadId,
    resourceId,
  })

  // Extract tool names from tool calls if present
  const toolsUsed: string[] = []
  if (response.toolCalls && Array.isArray(response.toolCalls)) {
    for (const call of response.toolCalls) {
      const name =
        (call as { name?: string }).name ||
        (call as { toolName?: string }).toolName
      if (name) {
        toolsUsed.push(name)
      }
    }
  }

  return {
    answer: response.text,
    threadId,
    toolsUsed,
    sources: [], // TODO: Extract from tool results when MCP tools added
  }
}

/**
 * Ask a question with streaming response
 */
export async function askQuestionStream(
  question: string,
  options?: {
    threadId?: string
    resourceId?: string
  }
): Promise<StreamingResponse> {
  const threadId = options?.threadId ?? generateThreadId()
  const resourceId = options?.resourceId ?? 'default-user'

  const { textStream } = await researchAgent.stream(question, {
    threadId,
    resourceId,
  })

  return {
    stream: textStream,
    threadId,
  }
}

/**
 * Create a new conversation thread
 */
export async function createThread(): Promise<{ threadId: string }> {
  return { threadId: generateThreadId() }
}

/**
 * Get conversation history for a thread
 */
export async function getThreadHistory(
  threadId: string
): Promise<Array<{ role: string; content: string }>> {
  const result = await memory.query({
    threadId,
    resourceId: 'default-user',
  })

  if (!result?.messages) {
    return []
  }

  return result.messages.map((msg: { role: string; content: unknown }) => ({
    role: msg.role,
    content:
      typeof msg.content === 'string'
        ? msg.content
        : JSON.stringify(msg.content),
  }))
}

/**
 * Generate a unique thread ID
 */
function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
