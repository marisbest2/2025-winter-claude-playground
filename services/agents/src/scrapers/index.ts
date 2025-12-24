// Shared types
export type {
  Board,
  Meeting,
  MeetingDocument,
  MeetingSystemScraper,
} from './types'

// IQM2 Portal scrapers
export { IQM2BaseScraper, TeaneckIQM2Scraper } from './iqm2'

// Backwards compatibility alias
export { TeaneckIQM2Scraper as IQM2Scraper } from './iqm2'
