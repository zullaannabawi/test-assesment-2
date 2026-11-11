import type { MemberRepository } from '@/features/member-list/use-cases/member-repository'
import type { Member, MemberInput } from '@/features/member-list/domain/member'
import { MemberValidationFieldsError } from '@/features/member-list/domain/member-errors'
import { validateMemberInput } from '../domain/validate-member-input'

/** Full replacement with the same validation contract as create. */
export async function updateMember(
  repository: MemberRepository,
  id: number,
  input: Partial<MemberInput>,
): Promise<Member> {
  const result = validateMemberInput(input)
  if (!result.valid) {
    throw new MemberValidationFieldsError(result.fields)
  }
  return repository.updateMember(id, result.value)
}
