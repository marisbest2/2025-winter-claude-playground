'use client'

import { useState } from 'react'
import SampleQuestions from './SampleQuestions'
import AnswerDisplay from './AnswerDisplay'
import LoadingState from './LoadingState'
import ErrorMessage from './ErrorMessage'

export default function QAInterface() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)

  async function askQuestion(q: string) {
    if (!q.trim()) return

    setLoading(true)
    setError(null)
    setAnswer('')
    setCached(false)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: q }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get answer')
      }

      const data = await response.json()
      setAnswer(data.answer)
      setCached(data.cached || false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    askQuestion(question)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Ask About Teaneck Meetings
        </h1>
        <p className="mt-2 text-gray-600">
          Get instant answers about Teaneck Township government meetings,
          boards, and committees.
        </p>
      </div>

      <SampleQuestions onSelect={askQuestion} disabled={loading} />

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Or ask your own question..."
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </div>
      </form>

      {loading && <LoadingState />}

      {error && (
        <ErrorMessage message={error} onRetry={() => askQuestion(question)} />
      )}

      {answer && <AnswerDisplay content={answer} cached={cached} />}
    </div>
  )
}
