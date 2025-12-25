/**
 * Mastra Agent
 *
 * The main coordinator agent that orchestrates deep research.
 * Uses Mastra for:
 * - Multi-turn conversation memory
 * - Tool orchestration via MCP
 * - Response generation with Claude
 *
 * Types are aligned with Vercel AI SDK for UI compatibility.
 */

import type { ModelMessage } from 'ai'
import { researchAgent, memory } from './mastra'

/**
 * Response from askQuestion - AI SDK compatible
 */
export interface GenerateResponse {
  /** The generated text response */
  text: string
  /** Thread ID for conversation continuity */
  threadId: string
  /** Tool calls made during generation (raw from Mastra) */
  toolCalls: unknown[]
  /** Token usage stats */
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Response from askQuestionStream - AI SDK compatible
 */
export interface StreamResponse {
  /** Async iterable of text chunks */
  textStream: AsyncIterable<string>
  /** Thread ID for conversation continuity */
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
): Promise<GenerateResponse> {
  const threadId = options?.threadId ?? generateThreadId()
  const resourceId = options?.resourceId ?? 'default-user'

  const response = await researchAgent.generate(question, {
    threadId,
    resourceId,
  })

  return {
    text: response.text,
    threadId,
    toolCalls: response.toolCalls ?? [],
    usage: response.usage
      ? {
          promptTokens: response.usage.inputTokens ?? 0,
          completionTokens: response.usage.outputTokens ?? 0,
          totalTokens: response.usage.totalTokens ?? 0,
        }
      : undefined,
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
): Promise<StreamResponse> {
  const threadId = options?.threadId ?? generateThreadId()
  const resourceId = options?.resourceId ?? 'default-user'

  const { textStream } = await researchAgent.stream(question, {
    threadId,
    resourceId,
  })

  return {
    textStream,
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
 * Returns ModelMessage[] for AI SDK compatibility
 */
export async function getThreadHistory(
  threadId: string,
  resourceId: string = 'default-user'
): Promise<ModelMessage[]> {
  const result = await memory.query({
    threadId,
    resourceId,
  })

  if (!result?.messages) {
    return []
  }

  // Map to ModelMessage format
  return result.messages.map(
    (msg: { role: string; content: unknown }): ModelMessage => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content:
        typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content),
    })
  )
}

/**
 * Generate a unique thread ID
 */
function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
