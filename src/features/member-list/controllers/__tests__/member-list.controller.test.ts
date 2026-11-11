import { describe, it, expect, beforeEach } from 'vitest'
import {
  getMembersController,
  getMemberByIdController,
  getMemberStatsController,
  deleteMembersController,
} from '../member-list.controller'
import { setMemberRepository } from '@/composition/registry'
import { InMemoryMemberRepository } from '../../infrastructure/in-memory-member-repository'
import { ACCOUNT_STATUSES, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../domain/member'
import type { Member } from '../../domain/member'
import {
  EmptyDeletionSelectionError,
  MemberNotFoundError,
} from '../../domain/member-errors'

const sarah: Member = {
  id: 2048,
  full_name: 'Sarah Jenkins',
  email: 'sarah.jenkins@membercore.internal',
  job_title: 'Staff Frontend Engineer',
  department: DEPARTMENTS[0],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  bio: null,
  joined_at: '2022-02-14',
  activity: { repositories: 42, deployments: 1489 },
}

beforeEach(() => {
  setMemberRepository(new InMemoryMemberRepository([sarah]))
})

describe('member-list controller wiring (companion)', () => {
  it('delegates getMembers through the registry', async () => {
    const members = await getMembersController({ search: 'sarah' })
    expect(members).toHaveLength(1)
    expect(members[0].full_name).toBe('Sarah Jenkins')
  })

  it('delegates getMemberById and surfaces MemberNotFoundError', async () => {
    await expect(getMemberByIdController(2048)).resolves.toMatchObject({ id: 2048 })
    await expect(getMemberByIdController(9999)).rejects.toBeInstanceOf(MemberNotFoundError)
  })

  it('delegates getMemberStats through the registry', async () => {
    await expect(getMemberStatsController()).resolves.toMatchObject({
      total_members: 1,
      active_now: 1,
    })
  })

  it('delegates deleteMembers, guarding the empty selection', async () => {
    await expect(deleteMembersController([])).rejects.toBeInstanceOf(EmptyDeletionSelectionError)
    await expect(deleteMembersController([2048, 1])).resolves.toEqual({
      deleted: [2048],
      failed: [1],
    })
  })
})
