import type { MemberRepository } from '@/features/member-list/use-cases/member-repository'
import type { Member, MemberInput } from '@/features/member-list/domain/member'
import { MemberValidationFieldsError } from '@/features/member-list/domain/member-errors'
import { validateMemberInput } from '../domain/validate-member-input'

/** Validates first — invalid input throws without ever touching the repository. */
export async function createMember(
  repository: MemberRepository,
  input: Partial<MemberInput>,
): Promise<Member> {
  const result = validateMemberInput(input)
  if (!result.valid) {
    throw new MemberValidationFieldsError(result.fields)
  }
  return repository.createMember(result.value)
}
