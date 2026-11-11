import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Member, MemberInput } from '@/features/member-list/domain/member'
import {
  MemberEmailConflictError,
  MemberValidationFieldsError,
} from '@/features/member-list/domain/member-errors'
import {
  createMemberController,
  updateMemberController,
} from '@/features/member-form/controllers/member-form.controller'

/** Shape the slice keeps for inline field errors after a failed submit. */
export interface MemberFormServerError {
  code: string
  fields: Record<string, string>
}

function toServerError(error: unknown): MemberFormServerError {
  if (error instanceof MemberEmailConflictError) {
    // the conflict is always about the email field — surface it there (MF-14)
    return { code: 'CONFLICT', fields: { email: error.message } }
  }
  if (error instanceof MemberValidationFieldsError) {
    return { code: 'VALIDATION_ERROR', fields: error.fields }
  }
  return { code: 'UNEXPECTED', fields: {} }
}

export const submitCreateMember = createAsyncThunk<
  Member,
  Partial<MemberInput>,
  { rejectValue: MemberFormServerError }
>('memberForm/submitCreateMember', async (input, { rejectWithValue }) => {
  try {
    return await createMemberController(input)
  } catch (error) {
    return rejectWithValue(toServerError(error))
  }
})

export const submitUpdateMember = createAsyncThunk<
  Member,
  { id: number; input: Partial<MemberInput> },
  { rejectValue: MemberFormServerError }
>('memberForm/submitUpdateMember', async ({ id, input }, { rejectWithValue }) => {
  try {
    return await updateMemberController(id, input)
  } catch (error) {
    return rejectWithValue(toServerError(error))
  }
})
