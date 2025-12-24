import Anthropic from '@anthropic-ai/sdk'
import { buildMeetingQAPrompt, type MeetingData } from './prompts'

export async function askAboutMeetings(
  question: string,
  data: MeetingData
): Promise<string> {
  // Initialize Anthropic client with explicit API key check
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. Please add it to .env.local'
    )
  }

  const anthropic = new Anthropic({
    apiKey,
  })

  const prompt = buildMeetingQAPrompt(question, data)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = response.content[0]
  if (content && content.type === 'text') {
    return content.text
  }

  throw new Error('Unexpected response format from Claude')
}
