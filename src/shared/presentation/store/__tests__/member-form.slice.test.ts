import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  submitCreateMember,
  submitUpdateMember,
} from '../actions/member-form.action'
import { memberFormReducer, dismissCreated, dismissUpdated } from '../slices/member-form.slice'
import { makeStore } from '../index'
import {
  createMemberController,
  updateMemberController,
} from '@/features/member-form/controllers/member-form.controller'
import { MemberEmailConflictError } from '@/features/member-dashboard/domain/member-errors'
import {
  ACCOUNT_STATUSES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '@/features/member-dashboard/domain/member'
import type { Member, MemberInput } from '@/features/member-dashboard/domain/member'

vi.mock('@/features/member-form/controllers/member-form.controller', () => ({
  createMemberController: vi.fn(),
  updateMemberController: vi.fn(),
}))

const mockedCreate = vi.mocked(createMemberController)
const mockedUpdate = vi.mocked(updateMemberController)

const input: MemberInput = {
  full_name: 'Michael Phelps',
  email: 'michael.phelps@acme.org',
  job_title: 'Staff UI/UX Designer',
  department: DEPARTMENTS[1],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[1],
  bio: '',
}

const created: Member = {
  ...input,
  id: 2049,
  joined_at: '2026-11-10',
  activity: { repositories: 0, deployments: 0 },
}

beforeEach(() => {
  mockedCreate.mockReset().mockResolvedValue(created)
  mockedUpdate.mockReset().mockResolvedValue({ ...created, id: 2048 })
})

describe('member-form slice + thunks (companion)', () => {
  it('submitCreateMember fulfilled stores the created member for the modal', async () => {
    const store = makeStore()
    await store.dispatch(submitCreateMember(input))

    expect(mockedCreate).toHaveBeenCalledWith(input)
    const state = store.getState().memberForm
    expect(state.submitting).toBe(false)
    expect(state.created).toEqual(created)
    expect(state.serverError).toBeNull()
  })

  it('submitCreateMember rejected maps a 409 onto the email field', async () => {
    mockedCreate.mockRejectedValue(
      new MemberEmailConflictError('Email is already in use by another member'),
    )
    const store = makeStore()
    const action = await store.dispatch(submitCreateMember(input))

    expect(action.meta.requestStatus).toBe('rejected')
    const state = store.getState().memberForm
    expect(state.submitting).toBe(false)
    expect(state.created).toBeNull()
    expect(state.serverError).toEqual({
      code: 'CONFLICT',
      fields: { email: 'Email is already in use by another member' },
    })
  })

  it('submitUpdateMember fulfilled stores the updated member; dismiss closes the modals', async () => {
    const store = makeStore()
    await store.dispatch(submitUpdateMember({ id: 2048, input }))

    expect(mockedUpdate).toHaveBeenCalledWith(2048, input)
    expect(store.getState().memberForm.updated).toMatchObject({ id: 2048 })

    store.dispatch(dismissCreated())
    expect(store.getState().memberForm.created).toBeNull()
    store.dispatch(dismissUpdated())
    expect(store.getState().memberForm.updated).toBeNull()
  })

  it('reducer handles unknown actions with the initial shape', () => {
    const state = memberFormReducer(undefined, { type: 'unknown/action' })
    expect(state).toEqual({
      submitting: false,
      created: null,
      updated: null,
      serverError: null,
    })
  })
})
