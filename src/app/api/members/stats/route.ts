import { NextResponse } from 'next/server'
import { getMemberStore } from '../mocks'

/**
 * GET /api/members/stats — KPI cards.
 * Static segment wins over the dynamic `[id]` route (API-12 is the canary).
 */
export async function GET(): Promise<Response> {
  const stats = await getMemberStore().getMemberStats()
  return NextResponse.json(stats)
}
