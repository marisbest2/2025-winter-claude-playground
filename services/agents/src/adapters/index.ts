/**
 * Municipality Adapters
 *
 * Each adapter provides access to a specific municipality's meeting data.
 * The adapter pattern allows the MCP server to work with any municipality
 * regardless of their underlying meeting portal (IQM2, Granicus, Legistar, etc.)
 */

export * from './types'
export { TeaneckAdapter, createTeaneckAdapter } from './teaneck'

// Registry of available adapters
export const ADAPTERS = {
  teaneck: () => import('./teaneck').then(m => m.createTeaneckAdapter()),
  // Future: hackensack, bergenCounty, etc.
} as const

export type AdapterName = keyof typeof ADAPTERS
