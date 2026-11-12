import { describe, it, expect, beforeEach } from 'vitest'
import { GET as getMembersHandler, POST as postMemberHandler, DELETE as deleteMembersHandler } from '../route'
import { GET as getMemberByIdHandler, PUT as putMemberHandler } from '../[id]/route'
import { GET as getMemberStatsHandler } from '../stats/route'
import { computeStats } from '../_shared/compute-stats'
import { ACCOUNT_STATUSES, EMPLOYMENT_TYPES } from '@/features/member-list/domain/member'
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

  it('API-04: default order is id ascending (new members last) and the reserved sort param is accepted', async () => {
    const resDefault = await getMembersHandler(listRequest())
    const body = await resDefault.json()
    const ids = body.map((m: { id: number }) => m.id)
    expect(ids).toEqual(Array.from({ length: 10 }, (_, i) => 2039 + i))

    const resSorted = await getMembersHandler(listRequest('?sort=name'))
    expect(resSorted.status).toBe(200)
    expect((await resSorted.json()).map((m: { id: number }) => m.id)).toEqual(ids)
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

const michaelPayload = {
  full_name: 'Michael Phelps',
  email: 'michael.phelps@acme.org',
  account_status: ACCOUNT_STATUSES[0],
  job_title: 'Staff UI/UX Designer',
  department: 'Design',
  employment_type: EMPLOYMENT_TYPES[1],
  bio: 'Mainly working on low fidelity and high fidelity design generation',
}

function jsonRequest(url: string, method: 'POST' | 'PUT' | 'DELETE', body: unknown): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function isoToday(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

describe('mock API — POST /api/members', () => {
  it('API-06: a valid payload creates member 2049 with today and zeroed activity', async () => {
    const res = await postMemberHandler(jsonRequest(BASE, 'POST', michaelPayload))

    expect(res.status).toBe(201)
    const member = await res.json()
    expect(member).toMatchObject({
      id: 2049,
      ...michaelPayload,
      joined_at: isoToday(),
      activity: { repositories: 0, deployments: 0 },
    })
  })

  it('API-07: missing required fields and bad email return 422 with fields', async () => {
    const missing = await postMemberHandler(jsonRequest(BASE, 'POST', {}))
    expect(missing.status).toBe(422)
    const missingBody = await missing.json()
    expect(missingBody.error.code).toBe('VALIDATION_ERROR')
    expect(Object.keys(missingBody.error.fields)).toEqual(
      expect.arrayContaining(['full_name', 'email', 'job_title', 'department']),
    )

    const badEmail = await postMemberHandler(
      jsonRequest(BASE, 'POST', { ...michaelPayload, email: 'not-an-email' }),
    )
    expect(badEmail.status).toBe(422)
    expect((await badEmail.json()).error.fields.email).toMatch(/format/i)
  })

  it('API-08: a duplicate email (case-insensitive) returns 409 CONFLICT', async () => {
    const res = await postMemberHandler(
      jsonRequest(BASE, 'POST', {
        ...michaelPayload,
        email: 'SARAH.JENKINS@membercore.internal',
      }),
    )

    expect(res.status).toBe(409)
    expect((await res.json()).error.code).toBe('CONFLICT')
  })
})

describe('mock API — PUT /api/members/[id]', () => {
  const edited = {
    ...michaelPayload,
    full_name: 'Sarah Jenkins-Edited',
    email: 'sarah.jenkins@membercore.internal',
    department: 'Design',
  }

  it('API-09: update succeeds preserving id/joined_at/activity, and 404s on a missing id', async () => {
    const res = await putMemberHandler(
      jsonRequest(`${BASE}/2048`, 'PUT', edited),
      detailContext(2048),
    )

    expect(res.status).toBe(200)
    const member = await res.json()
    expect(member).toMatchObject({
      id: 2048,
      full_name: 'Sarah Jenkins-Edited',
      department: 'Design',
      joined_at: '2022-02-14',
      activity: { repositories: 42, deployments: 1489 },
    })

    const missing = await putMemberHandler(
      jsonRequest(`${BASE}/9999`, 'PUT', edited),
      detailContext(9999),
    )
    expect(missing.status).toBe(404)
    expect((await missing.json()).error.code).toBe('NOT_FOUND')
  })

  it('API-10: another member email conflicts with 409, keeping own email succeeds', async () => {
    const conflict = await putMemberHandler(
      jsonRequest(`${BASE}/2047`, 'PUT', { ...edited, email: 'sarah.jenkins@membercore.internal' }),
      detailContext(2047),
    )
    expect(conflict.status).toBe(409)
    expect((await conflict.json()).error.code).toBe('CONFLICT')

    const own = await putMemberHandler(
      jsonRequest(`${BASE}/2048`, 'PUT', edited),
      detailContext(2048),
    )
    expect(own.status).toBe(200)
  })
})

describe('mock API — DELETE /api/members', () => {
  it('API-11: partitions existing/missing ids (hard delete) and validates the body', async () => {
    const mixed = await deleteMembersHandler(jsonRequest(BASE, 'DELETE', { ids: [2039, 9999] }))
    expect(mixed.status).toBe(200)
    expect(await mixed.json()).toEqual({ deleted: [2039], failed: [9999] })

    // 2039 is gone for good — hard delete
    const gone = await getMemberByIdHandler(new Request(`${BASE}/2039`), detailContext(2039))
    expect(gone.status).toBe(404)

    const empty = await deleteMembersHandler(jsonRequest(BASE, 'DELETE', { ids: [] }))
    expect(empty.status).toBe(422)
    expect((await empty.json()).error.code).toBe('VALIDATION_ERROR')

    const notArray = await deleteMembersHandler(jsonRequest(BASE, 'DELETE', { ids: 'nope' }))
    expect(notArray.status).toBe(422)

    const noBody = await deleteMembersHandler(
      new Request(BASE, { method: 'DELETE', body: 'not-json' }),
    )
    expect(noBody.status).toBe(422)
  })
})
