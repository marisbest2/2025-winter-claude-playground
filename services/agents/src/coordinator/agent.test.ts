/**
 * Mastra Agent Tests
 *
 * TDD tests for the government records research agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Mastra dependencies
const mockGenerate = vi.fn()
const mockStream = vi.fn()
const mockQuery = vi.fn()

class MockLibSQLStore {
  url: string
  constructor(config: { url: string }) {
    this.url = config.url
  }
}

class MockMemory {
  storage: MockLibSQLStore
  options: Record<string, unknown>
  query = mockQuery
  constructor(config: {
    storage: MockLibSQLStore
    options?: Record<string, unknown>
  }) {
    this.storage = config.storage
    this.options = config.options || {}
  }
}

class MockAgent {
  name: string
  instructions: string
  model: string
  memory: MockMemory
  generate = mockGenerate
  stream = mockStream
  constructor(config: {
    name: string
    instructions: string
    model: string
    memory: MockMemory
  }) {
    this.name = config.name
    this.instructions = config.instructions
    this.model = config.model
    this.memory = config.memory
  }
}

vi.mock('@mastra/core/agent', () => ({
  Agent: MockAgent,
}))

vi.mock('@mastra/memory', () => ({
  Memory: MockMemory,
}))

vi.mock('@mastra/libsql', () => ({
  LibSQLStore: MockLibSQLStore,
}))

describe('askQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerate.mockResolvedValue({
      text: 'Test response about government records.',
      toolCalls: [],
    })
  })

  it('returns AgentResponse with answer, threadId, toolsUsed, sources', async () => {
    const { askQuestion } = await import('./agent')

    const response = await askQuestion('What boards exist in Teaneck?')

    expect(response).toHaveProperty('answer')
    expect(response).toHaveProperty('threadId')
    expect(response).toHaveProperty('toolsUsed')
    expect(response).toHaveProperty('sources')
    expect(typeof response.answer).toBe('string')
    expect(typeof response.threadId).toBe('string')
    expect(Array.isArray(response.toolsUsed)).toBe(true)
    expect(Array.isArray(response.sources)).toBe(true)
  })

  it('uses provided threadId', async () => {
    const { askQuestion } = await import('./agent')

    const response = await askQuestion('Test', { threadId: 'my-thread-123' })

    expect(response.threadId).toBe('my-thread-123')
    expect(mockGenerate).toHaveBeenCalledWith(
      'Test',
      expect.objectContaining({ threadId: 'my-thread-123' })
    )
  })

  it('generates threadId when not provided', async () => {
    const { askQuestion } = await import('./agent')

    const response = await askQuestion('Test')

    expect(response.threadId).toMatch(/^thread-/)
  })

  it('uses provided resourceId', async () => {
    const { askQuestion } = await import('./agent')

    await askQuestion('Test', { resourceId: 'user-456' })

    expect(mockGenerate).toHaveBeenCalledWith(
      'Test',
      expect.objectContaining({ resourceId: 'user-456' })
    )
  })

  it('throws error when agent fails (no silent fallback)', async () => {
    mockGenerate.mockRejectedValue(new Error('Database connection failed'))

    const { askQuestion } = await import('./agent')

    await expect(askQuestion('Test')).rejects.toThrow('Database connection failed')
  })
})

describe('askQuestionStream', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStream.mockResolvedValue({
      textStream: (async function* () {
        yield 'Hello '
        yield 'world'
      })(),
    })
  })

  it('returns stream and threadId', async () => {
    const { askQuestionStream } = await import('./agent')

    const response = await askQuestionStream('Test question')

    expect(response).toHaveProperty('stream')
    expect(response).toHaveProperty('threadId')
    expect(typeof response.threadId).toBe('string')
  })

  it('stream yields text chunks', async () => {
    const { askQuestionStream } = await import('./agent')

    const { stream } = await askQuestionStream('Test')
    const chunks: string[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    expect(chunks).toEqual(['Hello ', 'world'])
  })
})

describe('createThread', () => {
  it('returns object with threadId', async () => {
    const { createThread } = await import('./agent')

    const result = await createThread()

    expect(result).toHaveProperty('threadId')
    expect(typeof result.threadId).toBe('string')
  })

  it('generates unique threadIds', async () => {
    const { createThread } = await import('./agent')

    const result1 = await createThread()
    const result2 = await createThread()

    expect(result1.threadId).not.toBe(result2.threadId)
  })
})

describe('getThreadHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns array of messages', async () => {
    mockQuery.mockResolvedValue({
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ],
    })

    const { getThreadHistory } = await import('./agent')

    const history = await getThreadHistory('thread-123')

    expect(Array.isArray(history)).toBe(true)
    expect(history).toHaveLength(2)
    expect(history[0]).toEqual({ role: 'user', content: 'Hello' })
  })

  it('returns empty array for non-existent thread', async () => {
    mockQuery.mockResolvedValue({ messages: [] })

    const { getThreadHistory } = await import('./agent')

    const history = await getThreadHistory('non-existent')

    expect(history).toEqual([])
  })
})
