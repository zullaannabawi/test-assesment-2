import { createAsyncThunk } from '@reduxjs/toolkit'
import type { DeleteResult } from '@/features/member-list/domain/member'
import { deleteMembersController } from '@/features/member-list/controllers/member-list.controller'
import { clearSelectedMembers } from '../slices/member-list.slice'
import { fetchMembers, fetchMemberStats } from './member-list.action'

/**
 * Confirms a pending deletion. On success: stores the result for the modal,
 * clears the selection and refetches list + stats so the KPIs stay truthful.
 */
export const confirmDeleteMembers = createAsyncThunk<DeleteResult, number[]>(
  'memberDeletion/confirmDeleteMembers',
  async (ids, { dispatch }) => {
    const result = await deleteMembersController(ids)
    dispatch(clearSelectedMembers())
    dispatch(fetchMembers())
    dispatch(fetchMemberStats())
    return result
  },
)
