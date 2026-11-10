import type {
  DeleteResult,
  ListMembersFilter,
  Member,
  MemberInput,
  MemberStats,
} from '../domain/member'

/**
 * The member aggregate repository (six methods, one feature-owned interface).
 * `member-form` imports this interface for create/update — the cross-feature
 * precedent is `purchase` → `product-catalog`.
 */
export interface MemberRepository {
  getMembers(filter?: ListMembersFilter): Promise<Member[]>
  getMemberById(id: number): Promise<Member | null>
  getMemberStats(): Promise<MemberStats>
  createMember(input: MemberInput): Promise<Member>
  updateMember(id: number, input: MemberInput): Promise<Member>
  deleteMembers(ids: number[]): Promise<DeleteResult>
}
