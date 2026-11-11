import { createSlice } from '@reduxjs/toolkit'
import type { Member } from '@/features/member-list/domain/member'
import type { MemberFormServerError } from '../actions/member-form.action'
import { submitCreateMember, submitUpdateMember } from '../actions/member-form.action'

export interface MemberFormState {
  submitting: boolean
  /** Success modal (add) is open while non-null. */
  created: Member | null
  /** Success modal (update) is open while non-null. */
  updated: Member | null
  serverError: MemberFormServerError | null
}

const initialState: MemberFormState = {
  submitting: false,
  created: null,
  updated: null,
  serverError: null,
}

const memberFormSlice = createSlice({
  name: 'memberForm',
  initialState,
  reducers: {
    dismissCreated(state) {
      state.created = null
    },
    dismissUpdated(state) {
      state.updated = null
    },
    clearServerError(state) {
      state.serverError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCreateMember.pending, (state) => {
        state.submitting = true
        state.serverError = null
      })
      .addCase(submitCreateMember.fulfilled, (state, action) => {
        state.submitting = false
        state.created = action.payload
      })
      .addCase(submitCreateMember.rejected, (state, action) => {
        state.submitting = false
        state.serverError = action.payload ?? { code: 'UNEXPECTED', fields: {} }
      })
      .addCase(submitUpdateMember.pending, (state) => {
        state.submitting = true
        state.serverError = null
      })
      .addCase(submitUpdateMember.fulfilled, (state, action) => {
        state.submitting = false
        state.updated = action.payload
      })
      .addCase(submitUpdateMember.rejected, (state, action) => {
        state.submitting = false
        state.serverError = action.payload ?? { code: 'UNEXPECTED', fields: {} }
      })
  },
})

export const { dismissCreated, dismissUpdated, clearServerError } = memberFormSlice.actions
export const memberFormReducer = memberFormSlice.reducer
