import { createMemberRepository } from '@/composition/registry'
import type { Member, MemberInput } from '@/features/member-dashboard/domain/member'
import { createMember } from '../use-cases/create-member'
import { updateMember } from '../use-cases/update-member'

/** Presentation-facing controller for the write model (repo interface owned by member-dashboard). */
export function createMemberController(input: Partial<MemberInput>): Promise<Member> {
  return createMember(createMemberRepository(), input)
}

export function updateMemberController(
  id: number,
  input: Partial<MemberInput>,
): Promise<Member> {
  return updateMember(createMemberRepository(), id, input)
}
