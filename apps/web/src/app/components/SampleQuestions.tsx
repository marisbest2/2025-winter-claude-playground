'use client'

interface SampleQuestionsProps {
  onSelect: (question: string) => void
  disabled?: boolean
}

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: 'What boards and committees exist in Teaneck?',
    category: 'Boards',
  },
  {
    id: 2,
    question: 'What happened at the last Township Council meeting?',
    category: 'Recent',
  },
  {
    id: 3,
    question: 'Show me all meetings from the Planning Board this year',
    category: 'Search',
  },
  {
    id: 4,
    question:
      'What agenda items were discussed in the last Zoning Board meeting?',
    category: 'Details',
  },
  {
    id: 5,
    question: 'Are there any upcoming meetings scheduled?',
    category: 'Schedule',
  },
]

export default function SampleQuestions({
  onSelect,
  disabled,
}: SampleQuestionsProps) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-medium text-gray-700">
        Try these questions:
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_QUESTIONS.map(sq => (
          <button
            key={sq.id}
            onClick={() => onSelect(sq.question)}
            disabled={disabled}
            className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-xs uppercase text-gray-500">
              {sq.category}
            </span>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {sq.question}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
