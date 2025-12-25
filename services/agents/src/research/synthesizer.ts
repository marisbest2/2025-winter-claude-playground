/**
 * Synthesizer
 *
 * Combines research findings into a coherent answer with citations.
 * This is the "synthesis" phase of the deep research pattern.
 *
 * The synthesizer:
 * 1. Takes findings from multiple sources
 * 2. Identifies agreements and contradictions
 * 3. Generates a coherent answer
 * 4. Includes inline citations
 * 5. Notes uncertainty and gaps
 */

import type { ResearchResults, Source } from './researcher'

export interface SynthesizedAnswer {
  answer: string // Markdown with inline citations [1], [2], etc.
  sources: Source[] // Numbered source list
  contradictions: Contradiction[]
  gaps: string[] // What we couldn't find
  confidence: number // Overall confidence 0-1
}

export interface Contradiction {
  topic: string
  sourceA: Source
  claimA: string
  sourceB: Source
  claimB: string
}

/**
 * Synthesize research findings into a final answer
 */
export async function synthesize(
  results: ResearchResults
): Promise<SynthesizedAnswer> {
  console.log(`[Synthesizer] synthesize() - stub`)
  console.log(`  Findings: ${results.findings.length}`)
  console.log(`  Unexplored: ${results.unexplored.length}`)

  // TODO: Use Claude to:
  // 1. Combine findings into coherent narrative
  // 2. Add inline citations
  // 3. Identify and highlight contradictions
  // 4. Note what we couldn't find

  // Collect all sources
  const allSources = results.findings.flatMap(f => f.sources)

  return {
    answer: `Research in progress for: "${results.plan.originalQuery}"`,
    sources: allSources,
    contradictions: [],
    gaps: results.unexplored,
    confidence: 0,
  }
}

/**
 * Detect contradictions between sources
 */
export function detectContradictions(
  _findings: ResearchResults['findings']
): Contradiction[] {
  console.log(`[Synthesizer] detectContradictions() - stub`)

  // TODO: Compare claims from different sources
  // Flag when agenda says X but minutes say Y
  // Flag when video transcript contradicts official record

  return []
}

/**
 * Format answer with inline citations
 */
export function formatWithCitations(_text: string, _sources: Source[]): string {
  console.log(`[Synthesizer] formatWithCitations() - stub`)

  // TODO: Replace source references with [1], [2], etc.
  // Add numbered source list at end

  return ''
}
