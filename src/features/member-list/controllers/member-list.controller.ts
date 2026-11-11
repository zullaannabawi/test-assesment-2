import { createMemberRepository } from '@/composition/registry'
import type {
  DeleteResult,
  ListMembersFilter,
  Member,
  MemberStats,
} from '../domain/member'
import { getMembers } from '../use-cases/get-members'
import { getMemberById } from '../use-cases/get-member-by-id'
import { getMemberStats } from '../use-cases/get-member-stats'
import { deleteMembers } from '../use-cases/delete-members'

/**
 * Presentation-facing controller: each use case bound to the registry
 * repository. Slices/thunks call these — never the use cases directly.
 */
export function getMembersController(filter?: ListMembersFilter): Promise<Member[]> {
  return getMembers(createMemberRepository(), filter)
}

export function getMemberByIdController(id: number): Promise<Member> {
  return getMemberById(createMemberRepository(), id)
}

export function getMemberStatsController(): Promise<MemberStats> {
  return getMemberStats(createMemberRepository())
}

export function deleteMembersController(ids: number[]): Promise<DeleteResult> {
  return deleteMembers(createMemberRepository(), ids)
}
