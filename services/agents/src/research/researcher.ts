/**
 * Researcher
 *
 * Executes a research plan by querying data sources.
 * This is the "research" phase of the deep research pattern.
 *
 * The researcher:
 * 1. Takes a research plan with sub-questions
 * 2. Queries appropriate MCP tools for each sub-question
 * 3. Collects findings with source metadata
 * 4. Tracks what has been explored vs unexplored
 */

import type { ResearchPlan } from './planner'

export interface Finding {
  question: string
  answer: string
  sources: Source[]
  confidence: number // 0-1
}

export interface Source {
  type: 'meeting' | 'document' | 'transcript' | 'news'
  title: string
  url?: string
  date?: string
  excerpt?: string
}

export interface ResearchResults {
  plan: ResearchPlan
  findings: Finding[]
  unexplored: string[]
}

/**
 * Execute a research plan
 */
export async function executeResearch(
  plan: ResearchPlan,
  _municipality: string
): Promise<ResearchResults> {
  console.log(`[Researcher] executeResearch() - stub`)
  console.log(`  Query: "${plan.originalQuery}"`)
  console.log(`  Sub-questions: ${plan.subQuestions.length}`)

  // TODO: For each sub-question:
  // 1. Determine which MCP tools to call
  // 2. Call tools and collect results
  // 3. Extract relevant information
  // 4. Track sources for citation

  return {
    plan,
    findings: [],
    unexplored: plan.subQuestions.map(q => q.question),
  }
}

/**
 * Execute a single sub-question
 */
export async function executeSubQuestion(
  question: string,
  _municipality: string
): Promise<Finding> {
  console.log(`[Researcher] executeSubQuestion("${question}") - stub`)

  // TODO: Implement tool selection and execution

  return {
    question,
    answer: '',
    sources: [],
    confidence: 0,
  }
}
