import type {
  DeleteResult,
  ListMembersFilter,
  Member,
  MemberInput,
  MemberStats,
} from '../../domain/member'
import {
  ApiUnexpectedError,
  MemberEmailConflictError,
  MemberNotFoundError,
  MemberValidationFieldsError,
} from '../../domain/member-errors'
import type { MemberRepository } from '../../use-cases/member-repository'
import type { MemberDto } from './member-dto'
import { toMember } from './member-mapper'

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

/** HTTP implementation of MemberRepository against the mock API. */
export class ApiMemberRepository implements MemberRepository {
  constructor(
    private readonly baseUrl: string = process.env.NEXT_PUBLIC_BASE_API_URL ??
      'http://localhost:3000/api',
  ) {}

  private buildMembersUrl(filter?: ListMembersFilter): string {
    if (!filter) {
      return `${this.baseUrl}/members`
    }
    const params = new URLSearchParams()
    if (filter.search) {
      params.set('search', filter.search)
    }
    if (filter.status) {
      params.set('status', filter.status)
    }
    if (filter.department) {
      params.set('department', filter.department)
    }
    const query = params.toString()
    return query ? `${this.baseUrl}/members?${query}` : `${this.baseUrl}/members`
  }

  /** Fetches and translates non-2xx envelopes into typed domain errors. */
  private async request(url: string, init?: RequestInit): Promise<Response> {
    // single-arg call when there is no init — keeps argument assertions exact
    const response = await (init ? fetch(url, init) : fetch(url))
    if (!response.ok) {
      await this.throwDomainError(response)
    }
    return response
  }

  private async throwDomainError(response: Response): Promise<never> {
    const body = (await response.json().catch(() => null)) as
      | { error?: { code?: string; message?: string; fields?: Record<string, string> } }
      | null
    const envelope = body?.error ?? {}

    switch (response.status) {
      case 404:
        throw new MemberNotFoundError(envelope.message ?? 'Member not found')
      case 409:
        throw new MemberEmailConflictError(envelope.message ?? 'Email is already in use')
      case 422:
        throw new MemberValidationFieldsError(
          envelope.fields ?? {},
          envelope.message ?? 'Member data is invalid',
        )
      default:
        throw new ApiUnexpectedError(
          envelope.message ?? `Unexpected API error (${response.status})`,
        )
    }
  }

  async getMembers(filter?: ListMembersFilter): Promise<Member[]> {
    const response = await this.request(this.buildMembersUrl(filter))
    const dtos = (await response.json()) as MemberDto[]
    return dtos.map(toMember)
  }

  async getMemberById(id: number): Promise<Member | null> {
    const response = await this.request(`${this.baseUrl}/members/${id}`)
    return toMember((await response.json()) as MemberDto)
  }

  async getMemberStats(): Promise<MemberStats> {
    const response = await this.request(`${this.baseUrl}/members/stats`)
    return (await response.json()) as MemberStats
  }

  async createMember(input: MemberInput): Promise<Member> {
    const response = await this.request(`${this.baseUrl}/members`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    })
    return toMember((await response.json()) as MemberDto)
  }

  async updateMember(id: number, input: MemberInput): Promise<Member> {
    const response = await this.request(`${this.baseUrl}/members/${id}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    })
    return toMember((await response.json()) as MemberDto)
  }

  async deleteMembers(ids: number[]): Promise<DeleteResult> {
    const response = await this.request(`${this.baseUrl}/members`, {
      method: 'DELETE',
      headers: JSON_HEADERS,
      body: JSON.stringify({ ids }),
    })
    return (await response.json()) as DeleteResult
  }
}
