'use client'

import { useEffect, useState } from 'react'

export default function LoadingState() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 3000) // After 3s
    const timer2 = setTimeout(() => setStage(2), 8000) // After 8s
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const messages = [
    'Connecting to IQM2 portal...',
    'Fetching meeting data...',
    'Analyzing with Claude AI...',
  ]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
      <div>
        <p className="font-medium text-blue-900">{messages[stage]}</p>
        <p className="text-sm text-blue-700">This may take 10-15 seconds</p>
      </div>
    </div>
  )
}
