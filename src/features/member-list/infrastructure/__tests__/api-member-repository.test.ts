import { describe, it, expect, vi, afterEach } from 'vitest'
import type { MemberDto } from '../api/member-dto'
import { ApiMemberRepository } from '../api/api-member-repository'
import {
  ApiUnexpectedError,
  MemberEmailConflictError,
  MemberNotFoundError,
  MemberValidationFieldsError,
} from '../../domain/member-errors'
import { ACCOUNT_STATUSES, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../domain/member'
import type { MemberInput } from '../../domain/member'

const BASE = 'http://test.local/api'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

const sarahDto: MemberDto = {
  id: 2048,
  full_name: 'Sarah Jenkins',
  email: 'sarah.jenkins@membercore.internal',
  job_title: 'Staff Frontend Engineer',
  department: 'Engineering',
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  bio: null,
  joined_at: '2022-02-14',
  activity: { repositories: 42, deployments: 1489 },
}

const memberInput: MemberInput = {
  full_name: 'Sarah Jenkins',
  email: 'sarah.jenkins@membercore.internal',
  job_title: 'Staff Frontend Engineer',
  department: DEPARTMENTS[0],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  bio: null,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ApiMemberRepository', () => {
  it('MD-04: getMembers builds the filter URL and maps DTOs to domain members', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([sarahDto]))
    vi.stubGlobal('fetch', fetchMock)

    const repo = new ApiMemberRepository(BASE)
    const members = await repo.getMembers({
      search: 'sarah',
      status: 'active',
      department: 'Engineering',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/members?search=sarah&status=active&department=Engineering`,
    )
    expect(members).toHaveLength(1)
    expect(members[0]).toEqual({
      id: 2048,
      full_name: 'Sarah Jenkins',
      email: 'sarah.jenkins@membercore.internal',
      job_title: 'Staff Frontend Engineer',
      department: 'Engineering',
      account_status: ACCOUNT_STATUSES[0],
      employment_type: EMPLOYMENT_TYPES[0],
      bio: null,
      joined_at: '2022-02-14',
      activity: { repositories: 42, deployments: 1489 },
    })
  })

  it('MD-04: empty filter fetches the bare collection URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    const repo = new ApiMemberRepository(BASE)
    await repo.getMembers()

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/members`)
  })

  it('MD-05: maps 404 to MemberNotFoundError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { code: 'NOT_FOUND', message: 'Member not found' } }, 404),
      ),
    )

    const repo = new ApiMemberRepository(BASE)
    await expect(repo.getMemberById(9999)).rejects.toBeInstanceOf(MemberNotFoundError)
  })

  it('MD-05: maps 409 to MemberEmailConflictError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { code: 'CONFLICT', message: 'Email already registered' } }, 409),
      ),
    )

    const repo = new ApiMemberRepository(BASE)
    await expect(repo.createMember(memberInput)).rejects.toBeInstanceOf(MemberEmailConflictError)
  })

  it('MD-05: maps 422 to MemberValidationFieldsError carrying .fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request tidak valid',
              fields: { email: 'Format email tidak valid' },
            },
          },
          422,
        ),
      ),
    )

    const repo = new ApiMemberRepository(BASE)
    const error: unknown = await repo.updateMember(2048, memberInput).catch((e) => e)

    expect(error).toBeInstanceOf(MemberValidationFieldsError)
    expect((error as MemberValidationFieldsError).fields).toEqual({
      email: 'Format email tidak valid',
    })
  })

  it('MD-05: unexpected statuses become ApiUnexpectedError (companion)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 500)))

    const repo = new ApiMemberRepository(BASE)
    await expect(repo.getMembers()).rejects.toBeInstanceOf(ApiUnexpectedError)
  })

  it('companion: detail and stats hit their endpoint URLs and map through', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(sarahDto))
      .mockResolvedValueOnce(
        jsonResponse({
          total_members: 10,
          new_this_month: 1,
          active_now: 8,
          activity_rate: 80,
          departments: 2,
          active_units: 2,
          pending_invites: 5,
          expiring_soon: 3,
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const repo = new ApiMemberRepository(BASE)
    const member = await repo.getMemberById(2048)
    const stats = await repo.getMemberStats()

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${BASE}/members/2048`)
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE}/members/stats`)
    expect(member).toMatchObject({ activity: { repositories: 42, deployments: 1489 } })
    expect(stats.total_members).toBe(10)
  })
})

describe('ApiMemberRepository — write methods', () => {
  it('MF-09: createMember POSTs the exact snake_case contract body and maps the 201 result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sarahDto, 201))
    vi.stubGlobal('fetch', fetchMock)

    const repo = new ApiMemberRepository(BASE)
    const member = await repo.createMember(memberInput)

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberInput),
    })
    expect(member).toMatchObject({
      id: 2048,
      full_name: 'Sarah Jenkins',
      bio: null,
      activity: { repositories: 42, deployments: 1489 },
    })
  })

  it('MF-10: updateMember PUTs to the member URL with the body and maps the result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sarahDto))
    vi.stubGlobal('fetch', fetchMock)

    const repo = new ApiMemberRepository(BASE)
    const member = await repo.updateMember(2048, memberInput)

    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/members/2048`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberInput),
    })
    expect(member.id).toBe(2048)
  })

  it('MF-11: write-path errors map 409 and 422 to the typed domain errors', async () => {
    const repo = new ApiMemberRepository(BASE)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { code: 'CONFLICT', message: 'Email already registered' } }, 409),
      ),
    )
    await expect(repo.updateMember(2048, memberInput)).rejects.toBeInstanceOf(
      MemberEmailConflictError,
    )

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request tidak valid',
              fields: { department: 'Department value is not valid' },
            },
          },
          422,
        ),
      ),
    )
    const error: unknown = await repo.createMember(memberInput).catch((e) => e)
    expect(error).toBeInstanceOf(MemberValidationFieldsError)
    expect((error as MemberValidationFieldsError).fields).toEqual({
      department: 'Department value is not valid',
    })
  })
})
