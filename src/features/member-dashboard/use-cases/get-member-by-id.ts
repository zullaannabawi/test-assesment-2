import type { MemberRepository } from './member-repository'
import type { Member } from '../domain/member'
import { MemberNotFoundError } from '../domain/member-errors'

/** Loads a member or throws `MemberNotFoundError` — callers never handle null. */
export async function getMemberById(
  repository: MemberRepository,
  id: number,
): Promise<Member> {
  const member = await repository.getMemberById(id)
  if (member === null) {
    throw new MemberNotFoundError(`Member #MEM-${id} not found`)
  }
  return member
}
