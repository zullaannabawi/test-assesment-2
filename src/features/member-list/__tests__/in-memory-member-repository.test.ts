import { describe, it, expect } from 'vitest'
import { ACCOUNT_STATUSES, DEPARTMENTS, EMPLOYMENT_TYPES } from '../domain/member'
import type { Member } from '../domain/member'
import { computeMemberStats } from '../domain/member-stats'
import {
  MemberEmailConflictError,
  MemberNotFoundError,
} from '../domain/member-errors'
import { InMemoryMemberRepository } from '../infrastructure/in-memory-member-repository'

function fixture(overrides: Partial<Member> = {}): Member {
  return {
    id: 2048,
    full_name: 'Sarah Jenkins',
    email: 'sarah.jenkins@membercore.internal',
    job_title: 'Staff Frontend Engineer',
    department: DEPARTMENTS[0],
    account_status: ACCOUNT_STATUSES[0],
    employment_type: EMPLOYMENT_TYPES[0],
    bio: 'Frontend architecture lead.',
    joined_at: '2022-02-14',
    activity: { repositories: 42, deployments: 1489 },
    ...overrides,
  }
}

const sarah = fixture()
const michael = fixture({
  id: 2039,
  full_name: 'Michael Phelps',
  email: 'michael.phelps@acme.org',
  job_title: 'Staff UI/UX Designer',
  department: DEPARTMENTS[1],
  account_status: ACCOUNT_STATUSES[1],
  employment_type: EMPLOYMENT_TYPES[1],
  joined_at: '2024-05-20',
  activity: { repositories: 3, deployments: 12 },
})

describe('InMemoryMemberRepository (companion coverage)', () => {
  it('filters by partial case-insensitive search across name, email and job title', async () => {
    const repo = new InMemoryMemberRepository([sarah, michael])

    await expect(repo.getMembers({ search: 'SARAH' })).resolves.toHaveLength(1)
    await expect(repo.getMembers({ search: 'phelps@acme' })).resolves.toHaveLength(1)
    await expect(repo.getMembers({ search: 'designer' })).resolves.toHaveLength(1)
    await expect(repo.getMembers({ search: 'nope' })).resolves.toEqual([])
  })

  it('filters by short status prefix and exact department, default-sorted by id ascending', async () => {
    const repo = new InMemoryMemberRepository([sarah, michael])

    const inactive = await repo.getMembers({ status: 'inactive' })
    expect(inactive.map((m) => m.id)).toEqual([2039])

    const engineering = await repo.getMembers({ department: 'Engineering' })
    expect(engineering.map((m) => m.id)).toEqual([2048])

    const all = await repo.getMembers()
    expect(all.map((m) => m.id)).toEqual([2039, 2048])
  })

  it('returns a member by id and null when missing', async () => {
    const repo = new InMemoryMemberRepository([sarah])

    await expect(repo.getMemberById(2048)).resolves.toMatchObject({ full_name: 'Sarah Jenkins' })
    await expect(repo.getMemberById(1)).resolves.toBeNull()
  })

  it('creates with the next id, today as joined_at and zeroed activity', async () => {
    const repo = new InMemoryMemberRepository([sarah])
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`

    const created = await repo.createMember({
      full_name: 'Michael Phelps',
      email: 'michael.phelps@acme.org',
      job_title: 'Staff UI/UX Designer',
      department: DEPARTMENTS[1],
      account_status: ACCOUNT_STATUSES[1],
      employment_type: EMPLOYMENT_TYPES[1],
      bio: null,
    })

    expect(created.id).toBe(2049)
    expect(created.joined_at).toBe(iso)
    expect(created.activity).toEqual({ repositories: 0, deployments: 0 })
    await expect(repo.getMemberById(2049)).resolves.toMatchObject({ id: 2049 })
  })

  it('rejects create when the email is already taken (case-insensitive)', async () => {
    const repo = new InMemoryMemberRepository([sarah])

    await expect(
      repo.createMember({
        full_name: 'Clone Jenkins',
        email: 'SARAH.JENKINS@membercore.internal',
        job_title: 'Engineer',
        department: DEPARTMENTS[0],
        account_status: ACCOUNT_STATUSES[0],
        employment_type: EMPLOYMENT_TYPES[0],
        bio: null,
      }),
    ).rejects.toBeInstanceOf(MemberEmailConflictError)
  })

  it('updates editable fields while preserving id, joined_at and activity', async () => {
    const repo = new InMemoryMemberRepository([sarah])

    const updated = await repo.updateMember(2048, {
      full_name: 'Sarah Jenkins-Brown',
      email: 'sarah.jenkins@membercore.internal',
      job_title: 'Principal Frontend Engineer',
      department: DEPARTMENTS[0],
      account_status: ACCOUNT_STATUSES[0],
      employment_type: EMPLOYMENT_TYPES[0],
      bio: 'Promoted.',
    })

    expect(updated).toMatchObject({
      id: 2048,
      full_name: 'Sarah Jenkins-Brown',
      job_title: 'Principal Frontend Engineer',
      bio: 'Promoted.',
    })
    expect(updated.joined_at).toBe('2022-02-14')
    expect(updated.activity).toEqual({ repositories: 42, deployments: 1489 })
  })

  it('rejects update to an email owned by another member, allows keeping own email', async () => {
    const repo = new InMemoryMemberRepository([sarah, michael])

    await expect(
      repo.updateMember(2039, {
        ...michael,
        email: 'sarah.jenkins@membercore.internal',
      }),
    ).rejects.toBeInstanceOf(MemberEmailConflictError)

    await expect(
      repo.updateMember(2039, { ...michael, email: 'Michael.Phelps@acme.org' }),
    ).resolves.toMatchObject({ id: 2039 })
  })

  it('throws MemberNotFoundError when updating a missing id', async () => {
    const repo = new InMemoryMemberRepository([sarah])

    await expect(repo.updateMember(1, { ...sarah })).rejects.toBeInstanceOf(MemberNotFoundError)
  })

  it('deletes existing ids and partitions missing ones into failed', async () => {
    const repo = new InMemoryMemberRepository([sarah, michael])

    await expect(repo.deleteMembers([2039, 1])).resolves.toEqual({ deleted: [2039], failed: [1] })
    await expect(repo.getMemberById(2039)).resolves.toBeNull()
    await expect(repo.getMemberById(2048)).resolves.toMatchObject({ id: 2048 })
  })

  it('exposes stats derived from the current members', async () => {
    const today = new Date()
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`
    // joined today (inactive) → new_this_month is 1 on any run date, active_now unchanged
    const newbie = fixture({ id: 2049, account_status: ACCOUNT_STATUSES[1], joined_at: todayIso })
    const repo = new InMemoryMemberRepository([sarah, michael, newbie])

    await expect(repo.getMemberStats()).resolves.toEqual({
      total_members: 3,
      new_this_month: 1,
      active_now: 1,
      activity_rate: 33,
      departments: 2,
      active_units: 1,
      pending_invites: 5,
      expiring_soon: 3,
    })
  })
})

describe('computeMemberStats (companion coverage)', () => {
  it('derives every KPI from the member list and the reference date', () => {
    const joinedThisMonth = fixture({
      id: 2050,
      account_status: ACCOUNT_STATUSES[1],
      department: DEPARTMENTS[1],
      joined_at: '2026-11-02',
    })
    const stats = computeMemberStats([sarah, joinedThisMonth], new Date(2026, 10, 10))

    expect(stats).toEqual({
      total_members: 2,
      new_this_month: 1,
      active_now: 1,
      activity_rate: 50,
      departments: 2,
      active_units: 1,
      pending_invites: 5,
      expiring_soon: 3,
    })
  })

  it('returns zeroed rate and empty month count for an empty list', () => {
    const stats = computeMemberStats([], new Date(2026, 10, 10))

    expect(stats.total_members).toBe(0)
    expect(stats.activity_rate).toBe(0)
    expect(stats.new_this_month).toBe(0)
  })
})
