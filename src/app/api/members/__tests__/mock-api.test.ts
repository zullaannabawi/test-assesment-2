import { describe, it, expect, beforeEach } from 'vitest'
import { GET as getMembersHandler } from '../route'
import { GET as getMemberByIdHandler } from '../[id]/route'
import { GET as getMemberStatsHandler } from '../stats/route'
import { computeStats } from '../_shared/compute-stats'
import { ACCOUNT_STATUSES } from '@/features/member-dashboard/domain/member'
import { resetMemberStore, SEED_MEMBERS } from '../mocks'

const BASE = 'http://localhost:3000/api/members'

function listRequest(query = ''): Request {
  return new Request(`${BASE}${query}`)
}

function detailContext(id: number): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id: String(id) }) }
}

beforeEach(() => {
  resetMemberStore()
})

describe('mock API — GET /api/members', () => {
  it('API-01: returns all 10 seed members with the full member shape', async () => {
    const res = await getMembersHandler(listRequest())

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(10)
    expect(body.map((m: { id: number }) => m.id).sort((a: number, b: number) => a - b)).toEqual(
      Array.from({ length: 10 }, (_, i) => 2039 + i),
    )
    for (const member of body) {
      expect(member).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          full_name: expect.any(String),
          email: expect.any(String),
          job_title: expect.any(String),
          department: expect.any(String),
          account_status: expect.any(String),
          employment_type: expect.any(String),
          joined_at: expect.any(String),
          activity: expect.objectContaining({
            repositories: expect.any(Number),
            deployments: expect.any(Number),
          }),
        }),
      )
      // account_status round-trips the en-dash enum values exactly
      expect(ACCOUNT_STATUSES).toContain(member.account_status)
    }
  })

  it('API-02: search matches name, email and job title partially & case-insensitively', async () => {
    const byName = await (await getMembersHandler(listRequest('?search=sarah'))).json()
    const byNameUpper = await (await getMembersHandler(listRequest('?search=SARAH'))).json()
    const byEmail = await (await getMembersHandler(listRequest('?search=david.chen'))).json()
    const byJobTitle = await (await getMembersHandler(listRequest('?search=frontend'))).json()
    const noMatch = await (await getMembersHandler(listRequest('?search=zzz-not-there'))).json()

    expect(byName).toHaveLength(1)
    expect(byName[0].full_name).toBe('Sarah Jenkins')
    expect(byNameUpper).toHaveLength(1)
    expect(byEmail).toHaveLength(1)
    expect(byEmail[0].email).toBe('david.chen@membercore.internal')
    expect(byJobTitle).toHaveLength(3)
    expect(noMatch).toEqual([])
  })

  it('API-03: status maps by Active/Inactive prefix and department matches exactly', async () => {
    const inactive = await (await getMembersHandler(listRequest('?status=inactive'))).json()
    const design = await (await getMembersHandler(listRequest('?department=Design'))).json()
    const wrongCase = await (await getMembersHandler(listRequest('?department=design'))).json()

    expect(inactive).toHaveLength(2)
    for (const member of inactive) {
      expect(member.account_status).toBe(ACCOUNT_STATUSES[1])
    }
    expect(design).toHaveLength(3)
    for (const member of design) {
      expect(member.department).toBe('Design')
    }
    // department is exact match — lowercase query finds nothing
    expect(wrongCase).toEqual([])
  })

  it('API-04: default sort is joined_at desc and the reserved sort param is accepted', async () => {
    const resDefault = await getMembersHandler(listRequest())
    const body = await resDefault.json()
    const dates = body.map((m: { joined_at: string }) => m.joined_at)
    const descending = [...dates].sort((a: string, b: string) => b.localeCompare(a))
    expect(dates).toEqual(descending)

    const resSorted = await getMembersHandler(listRequest('?sort=name'))
    expect(resSorted.status).toBe(200)
    expect((await resSorted.json()).map((m: { joined_at: string }) => m.joined_at)).toEqual(descending)
  })
})

describe('mock API — GET /api/members/[id]', () => {
  it('API-05: returns the member with activity, or 404 with the error shape', async () => {
    const ok = await getMemberByIdHandler(new Request(`${BASE}/2048`), detailContext(2048))
    expect(ok.status).toBe(200)
    const member = await ok.json()
    expect(member).toMatchObject({
      id: 2048,
      full_name: 'Sarah Jenkins',
      activity: { repositories: 42, deployments: 1489 },
    })

    const missing = await getMemberByIdHandler(new Request(`${BASE}/9999`), detailContext(9999))
    expect(missing.status).toBe(404)
    expect(await missing.json()).toEqual({
      error: expect.objectContaining({ code: 'NOT_FOUND' }),
    })
  })
})

describe('mock API — GET /api/members/stats', () => {
  it('API-12: computeStats derives the KPIs and the route serves them', async () => {
    const fixed = computeStats(SEED_MEMBERS, new Date(2026, 10, 10))
    expect(fixed).toEqual(
      expect.objectContaining({
        total_members: 10,
        active_now: 8,
        activity_rate: 80,
        departments: 2,
        active_units: 2,
        pending_invites: 5,
        expiring_soon: 3,
      }),
    )
    // the seed has exactly one member who joined in the current month
    expect(computeStats(SEED_MEMBERS).new_this_month).toBe(1)

    const res = await getMemberStatsHandler()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      total_members: 10,
      new_this_month: 1,
      active_now: 8,
      activity_rate: 80,
      departments: 2,
      active_units: 2,
      pending_invites: 5,
      expiring_soon: 3,
    })
  })
})
