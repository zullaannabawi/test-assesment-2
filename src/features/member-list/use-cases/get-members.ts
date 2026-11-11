import type { MemberRepository } from './member-repository'
import type { ListMembersFilter, Member } from '../domain/member'

/** Trims each value and drops empty ones so the repository never sees noise. */
export async function getMembers(
  repository: MemberRepository,
  filter: ListMembersFilter = {},
): Promise<Member[]> {
  const normalized: ListMembersFilter = {}
  for (const key of ['search', 'status', 'department'] as const) {
    const value = filter[key]?.trim()
    if (value) {
      normalized[key] = value
    }
  }
  return repository.getMembers(normalized)
}
