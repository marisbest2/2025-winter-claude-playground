/**
 * Deep Research Module
 *
 * Implements the deep research pattern:
 * 1. Plan - Decompose query into sub-questions
 * 2. Research - Execute queries against data sources
 * 3. Synthesize - Combine findings with citations
 */

export * from './planner'
export * from './researcher'
export * from './synthesizer'

import { createResearchPlan, type ResearchPlan } from './planner'
import { executeResearch, type ResearchResults } from './researcher'
import { synthesize, type SynthesizedAnswer } from './synthesizer'

/**
 * Execute full deep research pipeline
 */
export async function deepResearch(
  query: string,
  municipality: string
): Promise<SynthesizedAnswer> {
  console.log(`[DeepResearch] Starting research for: "${query}"`)

  // Phase 1: Plan
  const plan: ResearchPlan = await createResearchPlan(query)
  console.log(
    `[DeepResearch] Plan created with ${plan.subQuestions.length} sub-questions`
  )

  // Phase 2: Research
  const results: ResearchResults = await executeResearch(plan, municipality)
  console.log(
    `[DeepResearch] Research complete with ${results.findings.length} findings`
  )

  // Phase 3: Synthesize
  const answer: SynthesizedAnswer = await synthesize(results)
  console.log(
    `[DeepResearch] Synthesis complete, confidence: ${answer.confidence}`
  )

  return answer
}
