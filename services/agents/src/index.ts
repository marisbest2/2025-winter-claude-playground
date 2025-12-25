/**
 * Government Records Deep Research Agent
 *
 * A multi-agent system for researching government records.
 *
 * Architecture:
 * - adapters/  - Municipality-specific data access (IQM2, Granicus, etc.)
 * - mcp/       - Domain-driven MCP tools for agent use
 * - research/  - Deep research components (plan, research, synthesize)
 * - coordinator/ - Mastra agent orchestration
 */

// Main entry point - Mastra agent
export {
  askQuestion,
  askQuestionStream,
  createThread,
  getThreadHistory,
  researchAgent,
  memory,
} from './coordinator'

// Deep research pipeline
export { deepResearch } from './research'

// MCP tools (for direct use or testing)
export * as mcp from './mcp'

// Adapters (for direct use or testing)
export * as adapters from './adapters'
