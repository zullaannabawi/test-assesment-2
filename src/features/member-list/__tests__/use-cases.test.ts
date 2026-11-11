import { describe, it, expect, vi } from 'vitest'
import type { MemberRepository } from '../use-cases/member-repository'
import { getMembers } from '../use-cases/get-members'
import { getMemberById } from '../use-cases/get-member-by-id'
import { deleteMembers } from '../use-cases/delete-members'
import { EmptyDeletionSelectionError, MemberNotFoundError } from '../domain/member-errors'

/** Full-interface mock — each test overrides only what it needs. */
function mockRepo(overrides: Partial<MemberRepository> = {}): MemberRepository {
  return {
    getMembers: vi.fn().mockResolvedValue([]),
    getMemberById: vi.fn().mockResolvedValue(null),
    getMemberStats: vi.fn().mockResolvedValue(null),
    createMember: vi.fn().mockResolvedValue(undefined),
    updateMember: vi.fn().mockResolvedValue(undefined),
    deleteMembers: vi.fn().mockResolvedValue({ deleted: [], failed: [] }),
    ...overrides,
  }
}

describe('member-list use cases', () => {
  it('MD-01: getMembers normalizes the filter before calling the repository', async () => {
    const repo = mockRepo()

    await getMembers(repo, { search: '  sarah  ', status: '', department: undefined })

    expect(repo.getMembers).toHaveBeenCalledTimes(1)
    expect(repo.getMembers).toHaveBeenCalledWith({ search: 'sarah' })
  })

  it('MD-02: getMemberById throws MemberNotFoundError when the repository returns null', async () => {
    const repo = mockRepo()

    await expect(getMemberById(repo, 2048)).rejects.toBeInstanceOf(MemberNotFoundError)
  })

  it('MD-03: deleteMembers with an empty selection throws without calling the repository', async () => {
    const repo = mockRepo()

    await expect(deleteMembers(repo, [])).rejects.toBeInstanceOf(EmptyDeletionSelectionError)
    expect(repo.deleteMembers).not.toHaveBeenCalled()
  })

  it('MD-03: deleteMembers passes the repository partition result through', async () => {
    const repo = mockRepo({
      deleteMembers: vi.fn().mockResolvedValue({ deleted: [1], failed: [2] }),
    })

    await expect(deleteMembers(repo, [1, 2])).resolves.toEqual({ deleted: [1], failed: [2] })
    expect(repo.deleteMembers).toHaveBeenCalledWith([1, 2])
  })
})
