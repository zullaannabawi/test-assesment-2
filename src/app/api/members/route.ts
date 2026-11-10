import { NextResponse } from 'next/server'
import type { ListMembersFilter } from '@/features/member-dashboard/domain/member'
import { MemberEmailConflictError } from '@/features/member-dashboard/domain/member-errors'
import { getMemberStore } from './mocks'
import { apiError } from './_shared/api-error'
import { parseMemberPayload } from './_shared/member-payload'

/**
 * GET /api/members — list with optional filters, no pagination.
 * `sort` is reserved: accepted but ignored (default joined_at desc in the store).
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)

  const filter: ListMembersFilter = {}
  const search = searchParams.get('search')
  if (search) {
    filter.search = search
  }
  const status = searchParams.get('status')
  if (status) {
    filter.status = status
  }
  const department = searchParams.get('department')
  if (department) {
    filter.department = department
  }

  const members = await getMemberStore().getMembers(filter)
  return NextResponse.json(members)
}

/** POST /api/members — create; 422 validation fields, 409 duplicate email. */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseMemberPayload(request)
  if (!parsed.ok) {
    return apiError(422, 'VALIDATION_ERROR', 'Request tidak valid', parsed.fields)
  }

  try {
    const member = await getMemberStore().createMember(parsed.value)
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    if (error instanceof MemberEmailConflictError) {
      return apiError(409, 'CONFLICT', error.message)
    }
    throw error
  }
}
