import type { MemberRepository } from '@/features/member-list/use-cases/member-repository'
import { ApiMemberRepository } from '@/features/member-list/infrastructure/api/api-member-repository'

let memberRepositoryInstance: MemberRepository | null = null

/**
 * Singleton member repository. Defaults to the HTTP implementation so dev runs
 * go through the mock API end to end; tests inject the in-memory repository
 * (or any double) via `setMemberRepository`.
 */
export function createMemberRepository(): MemberRepository {
  if (!memberRepositoryInstance) {
    memberRepositoryInstance = new ApiMemberRepository()
  }
  return memberRepositoryInstance
}

/** Test/DI seam — `null` resets to the default ApiMemberRepository. */
export function setMemberRepository(repo: MemberRepository | null): void {
  memberRepositoryInstance = repo
}
