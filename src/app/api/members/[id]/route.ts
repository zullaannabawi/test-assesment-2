import { NextResponse } from 'next/server'
import { getMemberStore } from '../mocks'
import { apiError } from '../_shared/api-error'

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
