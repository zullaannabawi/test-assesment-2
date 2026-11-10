import { createAsyncThunk } from '@reduxjs/toolkit'
import type { ListMembersFilter, Member, MemberStats } from '@/features/member-dashboard/domain/member'
import {
  getMembersController,
  getMemberStatsController,
} from '@/features/member-dashboard/controllers/member-dashboard.controller'

export const fetchMembers = createAsyncThunk<Member[], ListMembersFilter | undefined>(
  'memberDashboard/fetchMembers',
  (filter) => getMembersController(filter),
)

export const fetchMemberStats = createAsyncThunk<MemberStats, void>(
  'memberDashboard/fetchMemberStats',
  () => getMemberStatsController(),
)
