import { createAsyncThunk } from '@reduxjs/toolkit'
import type { DeletionResultWithNames } from '../slices/member-deletion.slice'
import { deleteMembersController } from '@/features/member-list/controllers/member-list.controller'
import { clearSelectedMembers } from '../slices/member-list.slice'
import { fetchMembers, fetchMemberStats } from './member-list.action'

/**
 * Executes a deletion directly (no confirmation step). Callers pass the member
 * names alongside the ids so the success modal can name them — the rows are
 * gone from the store by the time the modal renders. On success: stores the
 * result, clears the selection and refetches list + stats.
 */
export const confirmDeleteMembers = createAsyncThunk<
  DeletionResultWithNames,
  { ids: number[]; names: string[] }
>('memberDeletion/confirmDeleteMembers', async ({ ids, names }, { dispatch }) => {
  const result = await deleteMembersController(ids)
  dispatch(clearSelectedMembers())
  dispatch(fetchMembers())
  dispatch(fetchMemberStats())
  return { ...result, names }
})
