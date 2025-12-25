/**
 * Research Planner
 *
 * Decomposes complex user queries into sub-questions.
 * This is the "planning" phase of the deep research pattern.
 *
 * Example:
 * Input: "What happened with the Main St development?"
 * Output: [
 *   "Which board handles Main St development?",
 *   "What meetings discussed Main St development?",
 *   "What decisions were made?",
 *   "What is the current status?"
 * ]
 */

export interface ResearchPlan {
  originalQuery: string
  subQuestions: SubQuestion[]
  estimatedSources: string[]
}

export interface SubQuestion {
  question: string
  targetSources: ('meetings' | 'documents' | 'transcripts' | 'news')[]
  priority: number
}

/**
 * Decompose a user query into sub-questions for research
 */
export async function createResearchPlan(query: string): Promise<ResearchPlan> {
  console.log(`[Planner] createResearchPlan("${query}") - stub`)

  // TODO: Use Claude to decompose the query
  // For now, return a stub plan

  return {
    originalQuery: query,
    subQuestions: [
      {
        question: query,
        targetSources: ['meetings', 'documents'],
        priority: 1,
      },
    ],
    estimatedSources: ['meetings', 'documents'],
  }
}

/**
 * Refine a research plan based on initial findings
 */
export async function refinePlan(
  plan: ResearchPlan,
  _findings: unknown[]
): Promise<ResearchPlan> {
  console.log(`[Planner] refinePlan() - stub`)

  // TODO: Use Claude to identify gaps and add follow-up questions
  return plan
}
