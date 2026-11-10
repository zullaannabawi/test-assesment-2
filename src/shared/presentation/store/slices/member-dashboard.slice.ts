import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Member, MemberStats } from '@/features/member-dashboard/domain/member'
import { fetchMembers, fetchMemberStats } from '../actions/member-dashboard.action'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface MemberDashboardState {
  members: Member[]
  listStatus: AsyncStatus
  listError: string | null
  stats: MemberStats | null
  statsStatus: AsyncStatus
  selectedIds: number[]
}

const initialState: MemberDashboardState = {
  members: [],
  listStatus: 'idle',
  listError: null,
  stats: null,
  statsStatus: 'idle',
  selectedIds: [],
}

const memberDashboardSlice = createSlice({
  name: 'memberDashboard',
  initialState,
  reducers: {
    toggleSelectedMember(state, action: PayloadAction<number>) {
      const id = action.payload
      state.selectedIds = state.selectedIds.includes(id)
        ? state.selectedIds.filter((selected) => selected !== id)
        : [...state.selectedIds, id]
    },
    /** Selects all displayed ids; when they are already selected, deselects exactly those. */
    toggleSelectAllMembers(state, action: PayloadAction<number[]>) {
      const displayed = action.payload
      if (displayed.length === 0) {
        return
      }
      const allSelected = displayed.every((id) => state.selectedIds.includes(id))
      state.selectedIds = allSelected
        ? state.selectedIds.filter((id) => !displayed.includes(id))
        : Array.from(new Set([...state.selectedIds, ...displayed]))
    },
    clearSelectedMembers(state) {
      state.selectedIds = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.members = action.payload
        // keep the selection consistent with the rows on screen
        state.selectedIds = state.selectedIds.filter((id) =>
          action.payload.some((member) => member.id === id),
        )
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

export const { toggleSelectedMember, toggleSelectAllMembers, clearSelectedMembers } =
  memberDashboardSlice.actions

export const memberDashboardReducer = memberDashboardSlice.reducer
