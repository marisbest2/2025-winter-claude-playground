import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TeaneckIQM2Scraper } from './iqm2'

describe('TeaneckIQM2Scraper', () => {
  let scraper: TeaneckIQM2Scraper

  beforeAll(async () => {
    scraper = new TeaneckIQM2Scraper()
    await scraper.init()
  }, 30000) // 30s timeout for browser startup

  afterAll(async () => {
    await scraper.close()
  })

  it('should connect to IQM2 portal', async () => {
    const connected = await scraper.canConnect()
    expect(connected).toBe(true)
  }, 15000)

  it('should list boards/committees', async () => {
    const boards = await scraper.listBoards()
    expect(boards.length).toBeGreaterThan(0)
    expect(boards[0]).toHaveProperty('id')
    expect(boards[0]).toHaveProperty('name')
  }, 30000)

  it('should list meetings for a board', async () => {
    const boards = await scraper.listBoards()
    const firstBoard = boards[0]
    expect(firstBoard).toBeDefined()

    const meetings = await scraper.listMeetings(firstBoard!.id)
    expect(Array.isArray(meetings)).toBe(true)
  }, 30000)
})
