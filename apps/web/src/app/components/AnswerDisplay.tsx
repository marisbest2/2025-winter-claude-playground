'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AnswerDisplayProps {
  content: string
  cached?: boolean
}

export default function AnswerDisplay({ content, cached }: AnswerDisplayProps) {
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {cached && (
        <div className="mb-4 inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          Cached response
        </div>
      )}
      <div className="prose prose-blue max-w-none">
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
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
