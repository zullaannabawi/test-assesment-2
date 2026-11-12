import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/shared/presentation/store'
import { MemberListPage } from '@/features/member-list/presentation/pages/member-list'
import {
  deleteMembersController,
  getMembersController,
  getMemberStatsController,
} from '../controllers/member-list.controller'
import { ACCOUNT_STATUSES, DEPARTMENTS, EMPLOYMENT_TYPES } from '../domain/member'
import type { Member, MemberStats } from '../domain/member'

vi.mock('../controllers/member-list.controller', () => ({
  getMembersController: vi.fn(),
  getMemberStatsController: vi.fn(),
  deleteMembersController: vi.fn(),
}))

const mockedGetMembers = vi.mocked(getMembersController)
const mockedGetStats = vi.mocked(getMemberStatsController)
const mockedDelete = vi.mocked(deleteMembersController)

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
  id: 2047,
  full_name: 'David Chen',
  email: 'david.chen@membercore.internal',
  job_title: 'Senior Backend Engineer',
  department: DEPARTMENTS[0],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  bio: null,
  joined_at: '2023-03-06',
  activity: { repositories: 35, deployments: 942 },
}

const stats: MemberStats = {
  total_members: 10,
  new_this_month: 1,
  active_now: 8,
  activity_rate: 80,
  departments: 2,
  active_units: 2,
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
  mockedDelete.mockReset().mockResolvedValue({ deleted: [2048], failed: [] })
})

describe('delete flows', () => {
  it('MD-13: trash deletes directly (no confirm) -> success modal + refetch + selection reset', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('Sarah Jenkins')

    // select the row first so we can verify the selection is reset afterwards
    await user.click(screen.getByRole('checkbox', { name: 'Select Sarah Jenkins' }))

    mockedGetMembers.mockClear()
    mockedGetStats.mockClear()

    await user.click(screen.getByRole('button', { name: 'Delete Sarah Jenkins' }))

    // direct action delete — the confirm dialog (Cancel/Delete) never appears
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(mockedDelete).toHaveBeenCalledTimes(1)
    expect(mockedDelete).toHaveBeenCalledWith([2048])

    expect(await screen.findByText('Member Deleted Successfully')).toBeInTheDocument()
    const successDialog = screen.getByRole('dialog')
    expect(
      within(successDialog).getByText(
        'Sarah Jenkins (#MEM-2048) has been permanently removed from the workspace. All assigned permissions, active sessions, and access tokens have been revoked.',
      ),
    ).toBeInTheDocument()

    // design: the delete popup carries a Dismiss button on the footer strip
    await user.click(within(successDialog).getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // stats + list refetched once each after the delete
    expect(mockedGetMembers).toHaveBeenCalledTimes(1)
    expect(mockedGetStats).toHaveBeenCalledTimes(1)

    // selection cleared
    expect(screen.getByRole('checkbox', { name: 'Select Sarah Jenkins' })).not.toBeChecked()
  })

  it('MD-13: with rows selected, any row trash deletes the whole selection directly', async () => {
    const user = userEvent.setup()
    mockedDelete.mockResolvedValue({ deleted: [2048, 2047], failed: [] })
    renderDashboard()
    await screen.findByText('Sarah Jenkins')

    await user.click(screen.getByRole('checkbox', { name: 'Select all members' }))

    await user.click(screen.getByRole('button', { name: 'Delete David Chen' }))

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(mockedDelete).toHaveBeenCalledWith([2048, 2047])

    expect(await screen.findByText('Members Deleted Successfully')).toBeInTheDocument()
    expect(
      screen.getByText(
        '2 members has been permanently removed from the workspace. All assigned permissions, active sessions, and access tokens have been revoked.',
      ),
    ).toBeInTheDocument()
  })

  it('companion: with no selection, the trash deletes just that row', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('Sarah Jenkins')

    await user.click(screen.getByRole('button', { name: 'Delete David Chen' }))

    expect(mockedDelete).toHaveBeenCalledWith([2047])
  })
})
