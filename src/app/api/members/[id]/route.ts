import { NextResponse } from 'next/server'
import {
  MemberEmailConflictError,
  MemberNotFoundError,
} from '@/features/member-dashboard/domain/member-errors'
import { getMemberStore } from '../mocks'
import { apiError } from '../_shared/api-error'
import { parseMemberPayload } from '../_shared/member-payload'

/** GET /api/members/[id] — single member incl. activity, or 404 NOT_FOUND. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params
  const memberId = Number(id)

  const member = await getMemberStore().getMemberById(memberId)
  if (member === null) {
    return apiError(404, 'NOT_FOUND', `Member #MEM-${id} not found`)
  }
  return NextResponse.json(member)
}

/** PUT /api/members/[id] — full replacement preserving id/joined_at/activity. */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params
  const memberId = Number(id)

  const parsed = await parseMemberPayload(request)
  if (!parsed.ok) {
    return apiError(422, 'VALIDATION_ERROR', 'Request tidak valid', parsed.fields)
  }

  try {
    const member = await getMemberStore().updateMember(memberId, parsed.value)
    return NextResponse.json(member)
  } catch (error) {
    if (error instanceof MemberNotFoundError) {
      return apiError(404, 'NOT_FOUND', `Member #MEM-${id} not found`)
    }
    if (error instanceof MemberEmailConflictError) {
      return apiError(409, 'CONFLICT', error.message)
    }
    throw error
  }
}
