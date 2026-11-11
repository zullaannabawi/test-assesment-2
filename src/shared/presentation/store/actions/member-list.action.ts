import { createAsyncThunk } from '@reduxjs/toolkit'
import type { ListMembersFilter, Member, MemberStats } from '@/features/member-list/domain/member'
import {
  getMemberByIdController,
  getMembersController,
  getMemberStatsController,
} from '@/features/member-list/controllers/member-list.controller'

export const fetchMembers = createAsyncThunk<Member[], ListMembersFilter | undefined>(
  'memberList/fetchMembers',
  (filter) => getMembersController(filter),
)

export const fetchMemberStats = createAsyncThunk<MemberStats, void>(
  'memberList/fetchMemberStats',
  () => getMemberStatsController(),
)

export const fetchMemberById = createAsyncThunk<Member, number>(
  'memberList/fetchMemberById',
  (id) => getMemberByIdController(id),
)
