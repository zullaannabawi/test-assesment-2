import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/shared/presentation/store'
import {
  toggleSelectedMember,
  toggleSelectAllMembers,
} from '@/shared/presentation/store/slices/member-list.slice'
import { MemberListPage } from '@/features/member-list/presentation/pages/member-list'
import { downloadCsv, toCsv, type MemberCsvRow } from '@/shared/lib/csv'
import {
  getMembersController,
  getMemberStatsController,
} from '../controllers/member-list.controller'
import { ACCOUNT_STATUSES, DEPARTMENTS, EMPLOYMENT_TYPES } from '../domain/member'
import type { Member, MemberStats } from '../domain/member'

vi.mock('../controllers/member-list.controller', () => ({
  getMembersController: vi.fn(),
  getMemberStatsController: vi.fn(),
}))

vi.mock('@/shared/lib/csv', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/csv')>()
  return { ...actual, downloadCsv: vi.fn() }
})

const mockedGetMembers = vi.mocked(getMembersController)
const mockedGetStats = vi.mocked(getMemberStatsController)
const mockedDownloadCsv = vi.mocked(downloadCsv)

const sarah: Member = {
  id: 2048,
  full_name: 'Sarah Jenkins',
  email: 'sarah.jenkins@membercore.internal',
  job_title: 'Staff Frontend Engineer',
  department: DEPARTMENTS[0],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  bio: null,
  joined_at: '2022-02-14',
  activity: { repositories: 42, deployments: 1489 },
}

const david: Member = {
  id: 2044,
  full_name: 'David Chen',
  email: 'david.chen@membercore.internal',
  job_title: 'Product Designer',
  department: DEPARTMENTS[1],
  account_status: ACCOUNT_STATUSES[1],
  employment_type: EMPLOYMENT_TYPES[1],
  bio: null,
  joined_at: '2023-01-24',
  activity: { repositories: 35, deployments: 942 },
}

const stats: MemberStats = {
  total_members: 2,
  new_this_month: 0,
  active_now: 1,
  activity_rate: 50,
  departments: 2,
  active_units: 1,
  pending_invites: 5,
  expiring_soon: 3,
}

function renderDashboard() {
  return render(
    <Provider store={makeStore()}>
      <MemberListPage />
    </Provider>,
  )
}

beforeEach(() => {
  mockedGetMembers.mockReset().mockResolvedValue([sarah, david])
  mockedGetStats.mockReset().mockResolvedValue(stats)
  mockedDownloadCsv.mockReset()
})

describe('selection, bulk bar & CSV export', () => {
  it('MD-10: a row checkbox adds then removes the id from the selection', async () => {
    const user = userEvent.setup()
    renderDashboard()

    const sarahBox = await screen.findByRole('checkbox', { name: 'Select Sarah Jenkins' })
    expect(sarahBox).not.toBeChecked()
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument()

    await user.click(sarahBox)
    expect(sarahBox).toBeChecked()
    expect(screen.getByText('1 selected')).toBeInTheDocument()

    await user.click(sarahBox)
    expect(sarahBox).not.toBeChecked()
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument()
  })

  it('MD-11: header select-all toggles every displayed id and drives the bulk bar', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('Sarah Jenkins')

    const selectAll = screen.getByRole('checkbox', { name: 'Select all members' })
    expect(selectAll).not.toBeChecked()

    await user.click(selectAll)
    expect(screen.getByRole('checkbox', { name: 'Select Sarah Jenkins' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Select David Chen' })).toBeChecked()
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(selectAll).toBeChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Select David Chen' }))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(selectAll).toBePartiallyChecked()

    await user.click(selectAll)
    expect(screen.getByText('2 selected')).toBeInTheDocument()

    await user.click(selectAll)
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument()
    expect(screen.queryByText('2 selected')).not.toBeInTheDocument()
  })

  it('MD-12: Export CSV builds the file from the displayed (filtered) rows', async () => {
    const user = userEvent.setup()
    mockedGetMembers.mockResolvedValue([sarah]) // the filtered subset that is displayed
    renderDashboard()
    await screen.findByText('Sarah Jenkins')

    await user.click(screen.getByRole('button', { name: /export csv/i }))

    const expectedRow: MemberCsvRow = {
      full_name: sarah.full_name,
      email: sarah.email,
      job_title: sarah.job_title,
      department: sarah.department,
      account_status: sarah.account_status,
      joined_at: sarah.joined_at,
    }
    expect(mockedDownloadCsv).toHaveBeenCalledTimes(1)
    expect(mockedDownloadCsv).toHaveBeenCalledWith('members.csv', toCsv([expectedRow]))
  })
})

describe('selection reducers (companion)', () => {
  it('toggleSelectedMember adds then removes a single id', () => {
    const store = makeStore()
    store.dispatch(toggleSelectedMember(2048))
    expect(store.getState().memberList.selectedIds).toEqual([2048])
    store.dispatch(toggleSelectedMember(2048))
    expect(store.getState().memberList.selectedIds).toEqual([])
  })

  it('toggleSelectAllMembers unions displayed ids, then removes exactly those on toggle-off', () => {
    const store = makeStore()
    store.dispatch(toggleSelectAllMembers([1, 2]))
    expect(store.getState().memberList.selectedIds).toEqual([1, 2])

    store.dispatch(toggleSelectAllMembers([2, 3]))
    expect(store.getState().memberList.selectedIds).toEqual([1, 2, 3])

    store.dispatch(toggleSelectAllMembers([2, 3]))
    expect(store.getState().memberList.selectedIds).toEqual([1])
  })
})
