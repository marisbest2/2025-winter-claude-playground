import { NextRequest, NextResponse } from 'next/server'
import { TeaneckIQM2Scraper } from '@teaneck/agents'
import { askAboutMeetings } from '@/lib/claude-client'
import type { MeetingData } from '@/lib/prompts'

// In-memory cache for answers
const answerCache = new Map<string, string>()

// Configure route
export const maxDuration = 60 // 60 seconds timeout for Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      )
    }

    // Check cache first
    if (answerCache.has(question)) {
      console.log(`Cache hit for question: "${question}"`)
      return NextResponse.json({
        answer: answerCache.get(question),
        cached: true,
      })
    }

    console.log(`Processing new question: "${question}"`)

    // Initialize scraper
    const scraper = new TeaneckIQM2Scraper()
    let boards, meetings

    try {
      await scraper.init()

      // Fetch data in parallel where possible
      boards = await scraper.listBoards()

      // Get meetings from all boards (limited to avoid timeout)
      const meetingPromises = boards
        .slice(0, 3) // Limit to first 3 boards to avoid timeout
        .map(async board => {
          try {
            const boardMeetings = await scraper.listMeetings(board.id)
            return boardMeetings.slice(0, 5) // 5 most recent per board
          } catch (error) {
            console.error(
              `Error fetching meetings for board ${board.id}:`,
              error
            )
            return []
          }
        })

      const meetingsArrays = await Promise.all(meetingPromises)
      meetings = meetingsArrays.flat()

      console.log(
        `Fetched ${boards.length} boards and ${meetings.length} meetings`
      )
    } finally {
      // Always clean up the scraper
      await scraper.close()
    }

    // Prepare data for Claude
    const data: MeetingData = {
      boards,
      meetings,
    }

    // Ask Claude
    const answer = await askAboutMeetings(question, data)

    // Cache the answer
    answerCache.set(question, answer)
    console.log(`Cached answer for question: "${question}"`)

    return NextResponse.json({ answer, cached: false })
  } catch (error) {
    console.error('Error in /api/ask:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
