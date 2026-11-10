import { createSlice } from '@reduxjs/toolkit'
import type { Member, MemberStats } from '@/features/member-dashboard/domain/member'
import { fetchMembers, fetchMemberStats } from '../actions/member-dashboard.action'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface MemberDashboardState {
  members: Member[]
  listStatus: AsyncStatus
  listError: string | null
  stats: MemberStats | null
  statsStatus: AsyncStatus
}

const initialState: MemberDashboardState = {
  members: [],
  listStatus: 'idle',
  listError: null,
  stats: null,
  statsStatus: 'idle',
}

const memberDashboardSlice = createSlice({
  name: 'memberDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.members = action.payload
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.error.message ?? 'Failed to load members'
      })
      .addCase(fetchMemberStats.pending, (state) => {
        state.statsStatus = 'loading'
      })
      .addCase(fetchMemberStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded'
        state.stats = action.payload
      })
      .addCase(fetchMemberStats.rejected, (state) => {
        state.statsStatus = 'failed'
      })
  },
})

export const memberDashboardReducer = memberDashboardSlice.reducer
