import { describe, it, expect, vi } from 'vitest'
import type { MemberRepository } from '@/features/member-list/use-cases/member-repository'
import {
  MemberEmailConflictError,
  MemberNotFoundError,
  MemberValidationFieldsError,
} from '@/features/member-list/domain/member-errors'
import {
  ACCOUNT_STATUSES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '@/features/member-list/domain/member'
import type { Member, MemberInput } from '@/features/member-list/domain/member'
import { createMember } from '../use-cases/create-member'
import { updateMember } from '../use-cases/update-member'

const input: MemberInput = {
  full_name: 'Michael Phelps',
  email: 'michael.phelps@acme.org',
  job_title: 'Staff UI/UX Designer',
  department: DEPARTMENTS[1],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[1],
  bio: '',
}

const created: Member = { ...input, id: 2049, joined_at: '2026-11-10', activity: { repositories: 0, deployments: 0 } }

function mockRepo(overrides: Partial<MemberRepository> = {}): MemberRepository {
  return {
    getMembers: vi.fn().mockResolvedValue([]),
    getMemberById: vi.fn().mockResolvedValue(null),
    getMemberStats: vi.fn().mockResolvedValue(null),
    createMember: vi.fn().mockResolvedValue(created),
    updateMember: vi.fn().mockResolvedValue(created),
    deleteMembers: vi.fn().mockResolvedValue({ deleted: [], failed: [] }),
    ...overrides,
  }
}

describe('member-form use cases', () => {
  it('MF-05: createMember passes the validated input to the repository', async () => {
    const repo = mockRepo()

    const member = await createMember(repo, input)

    expect(member).toEqual(created)
    expect(repo.createMember).toHaveBeenCalledTimes(1)
    expect(repo.createMember).toHaveBeenCalledWith(input)
  })

  it('MF-06: createMember throws MemberValidationFieldsError without calling the repository', async () => {
    const repo = mockRepo()

    await expect(createMember(repo, { ...input, email: '' })).rejects.toBeInstanceOf(
      MemberValidationFieldsError,
    )
    expect(repo.createMember).not.toHaveBeenCalled()
  })

  it('MF-07: createMember propagates a repository email conflict', async () => {
    const repo = mockRepo({
      createMember: vi.fn().mockRejectedValue(new MemberEmailConflictError()),
    })

    await expect(createMember(repo, input)).rejects.toBeInstanceOf(MemberEmailConflictError)
  })

  it('MF-08: updateMember passes (id, input) through, and propagates a 404', async () => {
    const updated: Member = { ...created, full_name: 'Michael Phelps Jr.' }
    const repo = mockRepo({ updateMember: vi.fn().mockResolvedValue(updated) })

    const member = await updateMember(repo, 2049, input)
    expect(member).toEqual(updated)
    expect(repo.updateMember).toHaveBeenCalledWith(2049, input)

    const missing = mockRepo({
      updateMember: vi.fn().mockRejectedValue(new MemberNotFoundError()),
    })
    await expect(updateMember(missing, 9999, input)).rejects.toBeInstanceOf(MemberNotFoundError)
  })
})
