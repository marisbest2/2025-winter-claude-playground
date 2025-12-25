'use client'

import { useChat, type UIMessage } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SampleQuestions from './SampleQuestions'

/**
 * Chat component using AI SDK v6 useChat hook
 *
 * Provides multi-turn conversation with tool call transparency.
 */
export default function Chat() {
  // useChat uses /api/chat by default
  const { messages, sendMessage, status, error } = useChat()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSampleSelect = (question: string) => {
    sendMessage({ text: question })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex-none">
        <h1 className="text-3xl font-bold text-gray-900">
          Ask About Teaneck Meetings
        </h1>
        <p className="mt-2 text-gray-600">
          Get instant answers about Teaneck Township government meetings,
          boards, and committees.
        </p>
      </div>

      {/* Sample questions - shown when no messages */}
      {messages.length === 0 && (
        <SampleQuestions onSelect={handleSampleSelect} disabled={isLoading} />
      )}

      {/* Chat messages */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span className="ml-2 text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              Error: {error.message}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex-none pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your question..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * Message bubble component
 */
function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'

  // Get text content from parts
  const textContent =
    message.parts
      ?.filter(part => part.type === 'text')
      .map(part => (part as { type: 'text'; text: string }).text)
      .join('') || ''

  // Get tool call parts - in v6 they have type starting with 'tool-'
  const toolParts = message.parts?.filter(
    part => part.type.startsWith('tool-')
  )

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'border border-gray-200 bg-white shadow-sm'
        }`}
      >
        {/* Tool calls display */}
        {toolParts && toolParts.length > 0 && (
          <div className="mb-3 space-y-2">
            {toolParts.map((part, index) => {
              // Extract tool name from type (e.g., 'tool-list_boards' -> 'list_boards')
              const toolName = part.type.replace('tool-', '')
              const toolPart = part as {
                type: string
                state: string
                output?: unknown
                toolCallId: string
              }
              const isComplete = toolPart.state === 'output-available'
              return (
                <ToolCallDisplay
                  key={toolPart.toolCallId || index}
                  toolName={toolName}
                  state={isComplete ? 'result' : 'call'}
                  result={toolPart.output}
                />
              )
            })}
          </div>
        )}

        {/* Message content */}
        {isUser ? (
          <p>{textContent || message.parts?.[0]?.toString() || ''}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            {textContent ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {children} ↗
                    </a>
                  ),
                }}
              >
                {textContent}
              </ReactMarkdown>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Tool call display component
 */
function ToolCallDisplay({
  toolName,
  state,
  result,
}: {
  toolName: string
  state: 'partial-call' | 'call' | 'result'
  result?: unknown
}) {
  // Friendly names for government record tools
  const toolLabels: Record<string, { active: string; complete: string }> = {
    list_boards: {
      active: 'Fetching boards...',
      complete: 'Fetched boards',
    },
    search_meetings: {
      active: 'Searching meetings...',
      complete: 'Searched meetings',
    },
    get_meeting: {
      active: 'Getting meeting details...',
      complete: 'Retrieved meeting details',
    },
    search_documents: {
      active: 'Searching documents...',
      complete: 'Searched documents',
    },
    get_transcript: {
      active: 'Getting transcript...',
      complete: 'Retrieved transcript',
    },
  }

  const labels = toolLabels[toolName] || {
    active: `Running ${toolName}...`,
    complete: `Completed ${toolName}`,
  }

  const isComplete = state === 'result'

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-2">
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        {isComplete ? (
          <svg
            className="h-4 w-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        )}

        <span className="text-sm font-medium text-gray-700">
          {isComplete ? labels.complete : labels.active}
        </span>
      </div>

      {/* Show result summary if complete */}
      {isComplete && result !== undefined && (
        <div className="mt-1 text-xs text-gray-500">
          {String(summarizeResult(toolName, result))}
        </div>
      )}
    </div>
  )
}

/**
 * Summarize tool results in a user-friendly way
 */
function summarizeResult(toolName: string, result: unknown): string {
  if (!result) return ''

  if (Array.isArray(result)) {
    switch (toolName) {
      case 'list_boards':
        return `Found ${result.length} boards`
      case 'search_meetings':
        return `Found ${result.length} meetings`
      case 'search_documents':
        return `Found ${result.length} documents`
      default:
        return `${result.length} results`
    }
  }

  if (typeof result === 'object') {
    return 'Details retrieved'
  }

  return String(result)
}
