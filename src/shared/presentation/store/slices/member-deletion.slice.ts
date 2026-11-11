import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DeleteResult } from '@/features/member-list/domain/member'
import { confirmDeleteMembers } from '../actions/member-deletion.action'

export interface MemberDeletionState {
  /** Confirm dialog is open with these pending ids while non-null. */
  confirmingIds: number[] | null
  deleting: boolean
  /** Success modal is open while non-null (derived state — no extra boolean). */
  lastResult: DeleteResult | null
}

const initialState: MemberDeletionState = {
  confirmingIds: null,
  deleting: false,
  lastResult: null,
}

const memberDeletionSlice = createSlice({
  name: 'memberDeletion',
  initialState,
  reducers: {
    requestDeletion(state, action: PayloadAction<number[]>) {
      state.confirmingIds = action.payload
    },
    cancelDeletion(state) {
      state.confirmingIds = null
    },
    dismissDeletionResult(state) {
      state.lastResult = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirmDeleteMembers.pending, (state) => {
        state.deleting = true
      })
      .addCase(confirmDeleteMembers.fulfilled, (state, action) => {
        state.deleting = false
        state.confirmingIds = null
        state.lastResult = action.payload
      })
      .addCase(confirmDeleteMembers.rejected, (state) => {
        state.deleting = false
        state.confirmingIds = null
      })
  },
})

export const { requestDeletion, cancelDeletion, dismissDeletionResult } =
  memberDeletionSlice.actions
export const memberDeletionReducer = memberDeletionSlice.reducer
