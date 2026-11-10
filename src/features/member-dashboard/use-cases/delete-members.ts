import type { MemberRepository } from './member-repository'
import type { DeleteResult } from '../domain/member'
import { EmptyDeletionSelectionError } from '../domain/member-errors'

/**
 * Hard-deletes the selected ids. Guards an empty selection before touching the
 * repository, then passes the deleted/failed partition through.
 */
export async function deleteMembers(
  repository: MemberRepository,
  ids: number[],
): Promise<DeleteResult> {
  if (ids.length === 0) {
    throw new EmptyDeletionSelectionError()
  }
  return repository.deleteMembers(ids)
}
