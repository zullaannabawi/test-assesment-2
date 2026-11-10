import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/shared/presentation/store'
import { DashboardTemplate } from '@/shared/presentation/components/templates/dashboard-template'
import {
  getMembersController,
  getMemberStatsController,
} from '../controllers/member-dashboard.controller'
import { ACCOUNT_STATUSES, DEPARTMENTS, EMPLOYMENT_TYPES } from '../domain/member'
import type { Member, MemberStats } from '../domain/member'

vi.mock('../controllers/member-dashboard.controller', () => ({
  getMembersController: vi.fn(),
  getMemberStatsController: vi.fn(),
}))

const mockedGetMembers = vi.mocked(getMembersController)
const mockedGetStats = vi.mocked(getMemberStatsController)

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
      <DashboardTemplate />
    </Provider>,
  )
}

beforeEach(() => {
  mockedGetMembers.mockReset().mockResolvedValue([sarah, david])
  mockedGetStats.mockReset().mockResolvedValue(stats)
})

describe('dashboard page', () => {
  it('MD-06: mounting the dashboard dispatches fetchMembers and fetchMemberStats once', async () => {
    renderDashboard()

    expect(await screen.findByText('Sarah Jenkins')).toBeInTheDocument()

    expect(mockedGetMembers).toHaveBeenCalledTimes(1)
    expect(mockedGetStats).toHaveBeenCalledTimes(1)
  })

  it('MD-07: renders table rows with member details, pills, formatted date and actions', async () => {
    renderDashboard()

    const sarahRow = await screen.findByRole('row', { name: /sarah jenkins/i })
    expect(within(sarahRow).getByText('sarah.jenkins@membercore.internal')).toBeInTheDocument()
    expect(within(sarahRow).getByText('Staff Frontend Engineer')).toBeInTheDocument()
    expect(within(sarahRow).getByText('Engineering')).toBeInTheDocument()
    expect(within(sarahRow).getByText('Active')).toBeInTheDocument()
    expect(within(sarahRow).getByText('Feb 14, 2022')).toBeInTheDocument()
    expect(within(sarahRow).getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/members/2048/edit',
    )
    expect(
      within(sarahRow).getByRole('button', { name: 'Delete Sarah Jenkins' }),
    ).toBeInTheDocument()

    const davidRow = screen.getByRole('row', { name: /david chen/i })
    expect(within(davidRow).getByText('Inactive')).toBeInTheDocument()
    expect(within(davidRow).getByText('Design')).toBeInTheDocument()
  })

  it('MD-08: a typing burst debounces into exactly one refetch after 300ms', async () => {
    renderDashboard()
    const input = await screen.findByPlaceholderText(/search members/i)

    vi.useFakeTimers()
    try {
      mockedGetMembers.mockClear()

      // burst: 'sam' is superseded by 'sarah' before the debounce elapses
      fireEvent.change(input, { target: { value: 'sam' } })
      fireEvent.change(input, { target: { value: 'sarah' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(299)
      })
      expect(mockedGetMembers).not.toHaveBeenCalled()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1)
      })
      expect(mockedGetMembers).toHaveBeenCalledTimes(1)
      expect(mockedGetMembers).toHaveBeenCalledWith({ search: 'sarah' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('MD-09: empty search results show the empty state and Clear search refetches the full list', async () => {
    const user = userEvent.setup()
    mockedGetMembers
      .mockResolvedValueOnce([sarah]) // mount
      .mockResolvedValueOnce([]) // debounced search "ghost"

    renderDashboard()
    const input = await screen.findByPlaceholderText(/search members/i)

    await user.type(input, 'ghost')
    expect(await screen.findByText('No members found')).toBeInTheDocument()

    mockedGetMembers.mockClear()
    mockedGetMembers.mockResolvedValue([sarah])
    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(mockedGetMembers).toHaveBeenCalledTimes(1)
    expect(mockedGetMembers.mock.calls[0][0]).toBeUndefined()
    expect(await screen.findByText('Sarah Jenkins')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search members/i)).toHaveValue('')
  })
})
