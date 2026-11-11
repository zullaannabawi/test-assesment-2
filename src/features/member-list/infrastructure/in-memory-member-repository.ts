import type {
  DeleteResult,
  ListMembersFilter,
  Member,
  MemberInput,
  MemberStats,
} from '../domain/member'
import { MemberEmailConflictError, MemberNotFoundError } from '../domain/member-errors'
import { computeMemberStats } from '../domain/member-stats'
import type { MemberRepository } from '../use-cases/member-repository'

function clone(member: Member): Member {
  return { ...member, activity: { ...member.activity } }
}

function localIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * In-memory MemberRepository — fast test double and stand-in for the mock API.
 * Implements the same filtering/rules as the HTTP contract so it can be swapped
 * in via the registry without behaviour drift.
 */
export class InMemoryMemberRepository implements MemberRepository {
  private members: Member[]
  private nextId: number

  constructor(seed: Member[] = []) {
    this.members = seed.map(clone)
    this.nextId = seed.reduce((max, m) => Math.max(max, m.id), 0) + 1
  }

  async getMembers(filter: ListMembersFilter = {}): Promise<Member[]> {
    const search = filter.search?.toLowerCase()
    const status = filter.status?.toLowerCase()

    return this.members
      .filter((m) => {
        if (search && !`${m.full_name} ${m.email} ${m.job_title}`.toLowerCase().includes(search)) {
          return false
        }
        if (status && !m.account_status.toLowerCase().startsWith(status)) {
          return false
        }
        return !filter.department || m.department === filter.department
      })
      .sort((a, b) => b.joined_at.localeCompare(a.joined_at))
      .map(clone)
  }

  async getMemberById(id: number): Promise<Member | null> {
    const found = this.members.find((m) => m.id === id)
    return found ? clone(found) : null
  }

  async getMemberStats(): Promise<MemberStats> {
    return computeMemberStats(this.members)
  }

  async createMember(input: MemberInput): Promise<Member> {
    if (this.emailTaken(input.email)) {
      throw new MemberEmailConflictError()
    }
    const member: Member = {
      ...input,
      id: this.nextId++,
      joined_at: localIsoDate(new Date()),
      activity: { repositories: 0, deployments: 0 },
    }
    this.members.push(clone(member))
    return clone(member)
  }

  async updateMember(id: number, input: MemberInput): Promise<Member> {
    const index = this.members.findIndex((m) => m.id === id)
    if (index === -1) {
      throw new MemberNotFoundError(`Member #MEM-${id} not found`)
    }
    if (this.emailTaken(input.email, id)) {
      throw new MemberEmailConflictError()
    }
    // id / joined_at / activity are preserved — MemberInput omits them.
    const updated: Member = { ...this.members[index], ...input }
    this.members[index] = clone(updated)
    return clone(updated)
  }

  async deleteMembers(ids: number[]): Promise<DeleteResult> {
    const deleted: number[] = []
    const failed: number[] = []
    for (const id of ids) {
      const index = this.members.findIndex((m) => m.id === id)
      if (index === -1) {
        failed.push(id)
        continue
      }
      this.members.splice(index, 1)
      deleted.push(id)
    }
    return { deleted, failed }
  }

  private emailTaken(email: string, excludeId?: number): boolean {
    const needle = email.trim().toLowerCase()
    return this.members.some(
      (m) => m.id !== excludeId && m.email.trim().toLowerCase() === needle,
    )
  }
}
