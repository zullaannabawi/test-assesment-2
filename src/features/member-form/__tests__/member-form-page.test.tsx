import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/shared/presentation/store'
import { MemberFormPage } from '@/features/member-form/presentation/pages/member-form'
import { createMemberController } from '../controllers/member-form.controller'
import {
  ACCOUNT_STATUSES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '@/features/member-list/domain/member'
import type { Member } from '@/features/member-list/domain/member'
import {
  MemberEmailConflictError,
  MemberValidationFieldsError,
} from '@/features/member-list/domain/member-errors'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('../controllers/member-form.controller', () => ({
  createMemberController: vi.fn(),
  updateMemberController: vi.fn(),
}))

const mockedCreate = vi.mocked(createMemberController)

const created: Member = {
  id: 2049,
  full_name: 'Michael Phelps',
  email: 'michael.phelps@acme.org',
  job_title: 'Staff UI/UX Designer',
  department: DEPARTMENTS[1],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[1],
  bio: '',
  joined_at: '2026-11-10',
  activity: { repositories: 0, deployments: 0 },
}

function renderAddPage() {
  return render(
    <Provider store={makeStore()}>
      <MemberFormPage mode="create" />
    </Provider>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), 'Michael Phelps')
  await user.type(screen.getByLabelText(/work email/i), 'michael.phelps@acme.org')
  await user.type(screen.getByLabelText(/job title/i), 'Staff UI/UX Designer')
  await user.selectOptions(screen.getByLabelText(/department/i), DEPARTMENTS[1])
}

beforeEach(() => {
  pushMock.mockReset()
  mockedCreate.mockReset().mockResolvedValue(created)
})

describe('add member page', () => {
  it('MF-12: renders two sections, seven fields with helpers, required markers and enum options', () => {
    renderAddPage()

    expect(screen.getByRole('heading', { name: 'General Information' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Work Details & Permissions' }),
    ).toBeInTheDocument()

    for (const label of ['Full Name', 'Work Email', 'Account Status', 'Job Title', 'Department', 'Employment Type', 'Bio & Administrative Notes']) {
      expect(screen.getByLabelText(new RegExp(label, 'i'))).toBeInTheDocument()
    }

    // helper texts — only the three fields that carry one per the design JSON
    expect(screen.getByText('Displayed publicly across collaborative repositories.')).toBeInTheDocument()
    expect(screen.getByText('Used for SSO sign-in and security notifications.')).toBeInTheDocument()
    expect(screen.getByText('Controls login eligibility across organization SSO.')).toBeInTheDocument()
    expect(screen.queryByText('Team this member belongs to')).not.toBeInTheDocument()

    // required markers on the four required fields
    for (const id of ['full_name', 'email', 'job_title', 'department']) {
      const label = document.querySelector(`label[for="${id}"]`)
      expect(label?.textContent).toMatch(/\*/)
    }

    const optionsOf = (label: RegExp) =>
      within(screen.getByLabelText(label))
        .getAllByRole('option')
        .map((option) => option.textContent)

    expect(optionsOf(/account status/i)).toEqual([...ACCOUNT_STATUSES])
    expect(optionsOf(/department/i)).toEqual(['Select department', ...DEPARTMENTS])
    expect(optionsOf(/employment type/i)).toEqual([...EMPLOYMENT_TYPES])
  })

  it('MF-13: submitting with empty required fields shows inline errors without dispatching', async () => {
    const user = userEvent.setup()
    renderAddPage()

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    // the design renders each missing-required field with the short "Required" marker
    expect(await screen.findAllByText('Required')).toHaveLength(4)
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('MF-14: a 409 conflict marks the email field; 422 fields land on their inputs', async () => {
    const user = userEvent.setup()
    mockedCreate.mockRejectedValue(
      new MemberEmailConflictError('Email is already in use by another member'),
    )
    renderAddPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(
      await screen.findByText('Email is already in use by another member'),
    ).toBeInTheDocument()

    mockedCreate.mockRejectedValue(
      new MemberValidationFieldsError({ job_title: 'Job title value is not valid' }),
    )
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(await screen.findByText('Job title value is not valid')).toBeInTheDocument()
  })

  it('MF-15: a successful create opens the Added modal with name, code and Back to Dashboard', async () => {
    const user = userEvent.setup()
    renderAddPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    const modal = await screen.findByRole('dialog')
    expect(within(modal).getByText('Member Added Successfully')).toBeInTheDocument()
    expect(within(modal).getByText('Michael Phelps')).toBeInTheDocument()
    expect(within(modal).getByText('#MEM-2049')).toBeInTheDocument()

    await user.click(within(modal).getByRole('button', { name: /back to dashboard/i }))
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
