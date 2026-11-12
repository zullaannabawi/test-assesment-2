import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DeleteResult } from '@/features/member-list/domain/member'
import { confirmDeleteMembers } from '../actions/member-deletion.action'

export interface PendingDeletion {
  ids: number[]
  /** Names captured at request time — the rows disappear after the refetch. */
  names: string[]
}

export interface DeletionResultWithNames extends DeleteResult {
  names: string[]
}

export interface MemberDeletionState {
  /** Confirm dialog is open with these pending members while non-null. */
  confirming: PendingDeletion | null
  deleting: boolean
  /** Success modal is open while non-null (derived state — no extra boolean). */
  lastResult: DeletionResultWithNames | null
}

const initialState: MemberDeletionState = {
  confirming: null,
  deleting: false,
  lastResult: null,
}

const memberDeletionSlice = createSlice({
  name: 'memberDeletion',
  initialState,
  reducers: {
    requestDeletion(state, action: PayloadAction<PendingDeletion>) {
      state.confirming = action.payload
    },
    cancelDeletion(state) {
      state.confirming = null
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
        state.lastResult = action.payload
        state.confirming = null
      })
      .addCase(confirmDeleteMembers.rejected, (state) => {
        state.deleting = false
        state.confirming = null
      })
  },
})

export const { requestDeletion, cancelDeletion, dismissDeletionResult } =
  memberDeletionSlice.actions
export const memberDeletionReducer = memberDeletionSlice.reducer
