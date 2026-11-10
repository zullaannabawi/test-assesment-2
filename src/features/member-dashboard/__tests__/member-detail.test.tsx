import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/shared/presentation/store'
import EditMemberPage from '@/app/members/[id]/edit/page'
import {
  deleteMembersController,
  getMemberByIdController,
} from '../controllers/member-dashboard.controller'
import { updateMemberController } from '@/features/member-form/controllers/member-form.controller'
import { MemberNotFoundError } from '../domain/member-errors'
import {
  ACCOUNT_STATUSES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '../domain/member'
import type { Member } from '../domain/member'

const pushMock = vi.fn()
let routeId = '2048'
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ id: routeId }),
}))

vi.mock('../controllers/member-dashboard.controller', () => ({
  getMembersController: vi.fn(),
  getMemberStatsController: vi.fn(),
  getMemberByIdController: vi.fn(),
  deleteMembersController: vi.fn(),
}))

vi.mock('@/features/member-form/controllers/member-form.controller', () => ({
  createMemberController: vi.fn(),
  updateMemberController: vi.fn(),
}))

const mockedGetById = vi.mocked(getMemberByIdController)
const mockedDelete = vi.mocked(deleteMembersController)
const mockedUpdate = vi.mocked(updateMemberController)

const sarah: Member = {
  id: 2048,
  full_name: 'Sarah Jenkins',
  email: 'sarah.jenkins@membercore.internal',
  job_title: 'Staff Frontend Engineer',
  department: DEPARTMENTS[0],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  bio: 'Frontend architecture lead.',
  joined_at: '2022-02-14',
  activity: { repositories: 42, deployments: 1489 },
}

function renderEditPage(id: number) {
  routeId = String(id)
  return render(
    <Provider store={makeStore()}>
      <EditMemberPage />
    </Provider>,
  )
}

beforeEach(() => {
  pushMock.mockReset()
  mockedGetById.mockReset().mockResolvedValue(sarah)
  mockedDelete.mockReset().mockResolvedValue({ deleted: [2048], failed: [] })
  mockedUpdate.mockReset().mockResolvedValue(sarah)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('member detail / edit page', () => {
  it('ME-01: loads the member by route id and prefills the whole form', async () => {
    renderEditPage(2048)

    expect(await screen.findByLabelText(/full name/i)).toHaveValue('Sarah Jenkins')
    expect(screen.getByLabelText(/work email/i)).toHaveValue('sarah.jenkins@membercore.internal')
    expect(screen.getByLabelText(/job title/i)).toHaveValue('Staff Frontend Engineer')
    expect(screen.getByLabelText(/department/i)).toHaveValue('Engineering')
    expect(screen.getByLabelText(/employment type/i)).toHaveValue(EMPLOYMENT_TYPES[0])
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Frontend architecture lead.')
    expect(mockedGetById).toHaveBeenCalledWith(2048)
  })

  it('ME-02: renders the edit header and profile card', async () => {
    renderEditPage(2048)

    expect(await screen.findByText('#MEM-2048')).toBeInTheDocument()
    expect(screen.getByText('Joined Feb 14, 2022')).toBeInTheDocument()

    const card = screen.getByRole('region', { name: /profile/i })
    expect(within(card).getByText('SJ')).toBeInTheDocument()
    expect(within(card).getByText('Staff Frontend Engineer')).toBeInTheDocument()
    expect(within(card).getByText('sarah.jenkins@membercore.internal')).toBeInTheDocument()
    expect(within(card).getByText('42')).toBeInTheDocument()
    expect(within(card).getByText('1,489')).toBeInTheDocument()
    expect(within(card).getByText('Repositories')).toBeInTheDocument()
    expect(within(card).getByText('Deployments')).toBeInTheDocument()
  })

  it('ME-03: Copy ID writes the formatted code to the clipboard and shows a toast', async () => {
    const user = userEvent.setup() // installs its own clipboard stub — patch AFTER it
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    renderEditPage(2048)
    await screen.findByText('#MEM-2048')

    await user.click(screen.getByRole('button', { name: /copy id/i }))

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith('#MEM-2048')
    expect(screen.getByText('Member ID copied to clipboard')).toBeInTheDocument()
  })

  it('ME-04: an unknown id shows an error state without crashing', async () => {
    mockedGetById.mockRejectedValue(new MemberNotFoundError('Member #MEM-9999 not found'))
    renderEditPage(9999)

    expect(await screen.findByRole('alert')).toHaveTextContent(/member not found/i)
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute('href', '/')
  })

  it('ME-05: Delete Member confirms, deletes, and redirects to the dashboard', async () => {
    const user = userEvent.setup()
    renderEditPage(2048)
    await screen.findByText('#MEM-2048')

    await user.click(screen.getByRole('button', { name: /delete member/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(mockedDelete).toHaveBeenCalledWith([2048])
    expect(await screen.findByText('Member Deleted Successfully')).toBeInTheDocument()
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('MF-15: a successful update opens the Updated modal with Continue Editing / Back', async () => {
    const user = userEvent.setup()
    renderEditPage(2048)
    const nameInput = await screen.findByLabelText(/full name/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Sarah Jenkins-Brown')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(mockedUpdate).toHaveBeenCalledWith(2048, expect.objectContaining({ full_name: 'Sarah Jenkins-Brown' }))

    const modal = await screen.findByRole('dialog')
    expect(within(modal).getByText('Member Updated Successfully')).toBeInTheDocument()

    await user.click(within(modal).getByRole('button', { name: /continue editing/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalledWith('/')

    await user.click(screen.getByRole('button', { name: /save changes/i }))
    const reopened = await screen.findByRole('dialog')
    await user.click(within(reopened).getByRole('button', { name: /back to dashboard/i }))
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
