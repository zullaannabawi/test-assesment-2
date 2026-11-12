'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/presentation/store/hooks'
import { submitCreateMember, submitUpdateMember } from '@/shared/presentation/store/actions/member-form.action'
import { validateMemberInput } from '@/features/member-form/domain/validate-member-input'
import {
  ACCOUNT_STATUSES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '@/features/member-list/domain/member'
import type { Member, MemberInput } from '@/features/member-list/domain/member'
import { Button } from '../atoms/button'
import { Input } from '../atoms/input'
import { Select } from '../atoms/select'
import { Textarea } from '../atoms/textarea'
import { Text } from '../atoms/text'
import { FormField } from '../molecules/form-field'

interface MemberFormProps {
  mode: 'create' | 'edit'
  /** Edit mode: the member being edited (used for the update call). */
  member?: Member
  onCancel: () => void
  /** Left slot of the footer action bar (edit mode: Delete Member). */
  footerLeft?: ReactNode
}

const EMPTY_VALUES: Partial<MemberInput> = {
  full_name: '',
  email: '',
  job_title: '',
  department: undefined,
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[0],
  bio: '',
}

/**
 * The two-section member form inside one card, with the footer action bar
 * (left slot + Cancel/Save Changes). Validates client-side before dispatching.
 */
export function MemberForm({ mode, member, onCancel, footerLeft }: MemberFormProps) {
  const dispatch = useAppDispatch()
  const { submitting, serverError } = useAppSelector((state) => state.memberForm)
  const [values, setValues] = useState<Partial<MemberInput>>(
    member ? toFormValues(member) : EMPTY_VALUES,
  )
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  const setField = (name: keyof MemberInput, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  /** The design renders missing-required errors as the short marker "Required". */
  const errorFor = (name: string): string | undefined => {
    const raw = clientErrors[name] ?? serverError?.fields?.[name]
    return raw?.endsWith('is required') ? 'Required' : raw
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = validateMemberInput(values)
    if (!result.valid) {
      setClientErrors(result.fields)
      return
    }
    setClientErrors({})
    if (mode === 'create') {
      dispatch(submitCreateMember(result.value))
    } else if (member) {
      dispatch(submitUpdateMember({ id: member.id, input: result.value }))
    }
  }

  return (
    <form className="member-form" onSubmit={handleSubmit} noValidate>
      <div className="form-card">
        <section className="form-section">
          <Text as="h2" size="lg" weight="semibold" className="form-section__title">
            General Information
          </Text>
          <Text size="sm" className="form-section__subtitle">
            {mode === 'create'
              ? 'Add personal records, contact credentials, and communication metadata.'
              : 'Update personal records, contact credentials, and communication metadata.'}
          </Text>
          <div className="form-section__grid">
            <FormField
              label="Full Name"
              htmlFor="full_name"
              required
              helper="Displayed publicly across collaborative repositories."
              error={errorFor('full_name')}
            >
              <Input
                id="full_name"
                maxLength={100}
                value={values.full_name ?? ''}
                onChange={(e) => setField('full_name', e.target.value)}
              />
            </FormField>
            <FormField
              label="Work Email"
              htmlFor="email"
              required
              helper="Used for SSO sign-in and security notifications."
              error={errorFor('email')}
            >
              <Input
                id="email"
                maxLength={254}
                type="email"
                value={values.email ?? ''}
                onChange={(e) => setField('email', e.target.value)}
              />
            </FormField>
            <FormField
              label="Account Status"
              htmlFor="account_status"
              fullWidth
              helper="Controls login eligibility across organization SSO."
              error={errorFor('account_status')}
            >
              <Select
                id="account_status"
                value={values.account_status ?? ACCOUNT_STATUSES[0]}
                onChange={(e) => setField('account_status', e.target.value)}
              >
                {ACCOUNT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </section>

        <hr className="form-card__divider" />

        <section className="form-section">
          <Text as="h2" size="lg" weight="semibold" className="form-section__title">
            Work Details &amp; Permissions
          </Text>
          <Text size="sm" className="form-section__subtitle">
            Manage departmental allocations, administrative scopes, and governance clearance.
          </Text>
          <div className="form-section__grid">
            <FormField
              label="Job Title"
              htmlFor="job_title"
              required
              error={errorFor('job_title')}
            >
              <Input
                id="job_title"
                maxLength={100}
                value={values.job_title ?? ''}
                onChange={(e) => setField('job_title', e.target.value)}
              />
            </FormField>
            <FormField
              label="Department"
              htmlFor="department"
              required
              error={errorFor('department')}
            >
              <Select
                id="department"
                value={values.department ?? ''}
                onChange={(e) => setField('department', e.target.value)}
              >
                <option value="" disabled>
                  Select department
                </option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              label="Employment Type"
              htmlFor="employment_type"
              fullWidth
              error={errorFor('employment_type')}
            >
              <Select
                id="employment_type"
                value={values.employment_type ?? EMPLOYMENT_TYPES[0]}
                onChange={(e) => setField('employment_type', e.target.value)}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              label="Bio & Administrative Notes"
              htmlFor="bio"
              fullWidth
              error={errorFor('bio')}
            >
              <Textarea
                id="bio"
                maxLength={500}
                value={values.bio ?? ''}
                onChange={(e) => setField('bio', e.target.value)}
              />
            </FormField>
          </div>
        </section>

        <footer className="member-form__footer">
          {footerLeft ? <div className="member-form__footer-left">{footerLeft}</div> : null}
          <div className="member-form__footer-right">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </footer>
      </div>
    </form>
  )
}

function toFormValues(member: Member): Partial<MemberInput> {
  const { id: _id, joined_at: _joined, activity: _activity, ...input } = member
  return input
}
