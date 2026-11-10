import { NextResponse } from 'next/server'
import type { ListMembersFilter } from '@/features/member-dashboard/domain/member'
import { getMemberStore } from './mocks'

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
