/**
 * Quick test script for the Mastra agent
 * Run with: npx tsx scripts/test-agent.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load env from root
config({ path: resolve(__dirname, '../../../.env.local') })

import { askQuestion, createThread } from '../src/coordinator/agent'

async function main() {
  console.log('Testing Mastra agent...\n')

  // Create a thread
  const { threadId } = await createThread()
  console.log(`Created thread: ${threadId}\n`)

  // Ask a question
  console.log('Asking: "What boards exist in Teaneck?"\n')
  const response = await askQuestion('What boards exist in Teaneck?', {
    threadId,
  })

  console.log('Response:')
  console.log('-'.repeat(50))
  console.log(response.text)
  console.log('-'.repeat(50))
  console.log(`\nThread: ${response.threadId}`)
  console.log(`Tool calls: ${response.toolCalls.length}`)
  if (response.usage) {
    console.log(`Tokens: ${response.usage.totalTokens}`)
  }
}

main().catch(console.error)
