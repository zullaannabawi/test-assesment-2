import type { MemberRepository } from './member-repository'
import type { MemberStats } from '../domain/member'

/** Reads the dashboard KPI stats. */
export async function getMemberStats(repository: MemberRepository): Promise<MemberStats> {
  return repository.getMemberStats()
}
