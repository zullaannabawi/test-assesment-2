import { describe, it, expect } from 'vitest'
import { validateMemberInput } from '../domain/validate-member-input'
import {
  ACCOUNT_STATUSES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '@/features/member-list/domain/member'
import type { MemberInput } from '@/features/member-list/domain/member'

const validInput: MemberInput = {
  full_name: 'Michael Phelps',
  email: 'michael.phelps@acme.org',
  job_title: 'Staff UI/UX Designer',
  department: DEPARTMENTS[1],
  account_status: ACCOUNT_STATUSES[0],
  employment_type: EMPLOYMENT_TYPES[1],
  bio: 'Mainly working on low fidelity and high fidelity design generation',
}

describe('member-form domain — validateMemberInput', () => {
  it('MF-01: flags every missing required field', () => {
    const result = validateMemberInput({ bio: '' })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(Object.keys(result.fields)).toEqual(
        expect.arrayContaining(['full_name', 'email', 'job_title', 'department']),
      )
    }
  })

  it('MF-02: rejects a malformed email with a format message', () => {
    const result = validateMemberInput({ ...validInput, email: 'not-an-email' })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.fields.email).toMatch(/format/i)
    }
  })

  it('MF-03: rejects values outside the enum constants', () => {
    const result = validateMemberInput({
      ...validInput,
      department: 'Marketing' as MemberInput['department'],
      account_status: 'Banned' as MemberInput['account_status'],
      employment_type: 'Intern' as MemberInput['employment_type'],
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(Object.keys(result.fields)).toEqual(
        expect.arrayContaining(['department', 'account_status', 'employment_type']),
      )
    }
  })

  it('MF-04: accepts valid input and applies the optional-field defaults', () => {
    const { bio: _bio, account_status: _status, employment_type: _type, ...rest } = validInput
    const result = validateMemberInput(rest)

    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.value).toEqual({
        ...rest,
        account_status: ACCOUNT_STATUSES[0],
        employment_type: EMPLOYMENT_TYPES[0],
        bio: '',
      })
    }
  })

  it('companion: rejects HTML tags in free-text fields (XSS defense-in-depth)', () => {
    const scripted = validateMemberInput({
      ...validInput,
      full_name: 'Sarah <script>alert(1)</script>',
    })
    expect(scripted.valid).toBe(false)
    if (!scripted.valid) {
      expect(scripted.fields.full_name).toMatch(/html tags/i)
    }

    const imgPayload = validateMemberInput({ ...validInput, bio: '<img src=x onerror=alert(1)>' })
    expect(imgPayload.valid).toBe(false)
    if (!imgPayload.valid) {
      expect(imgPayload.fields.bio).toMatch(/html tags/i)
    }
  })

  it('companion: rejects angle-bracket content in the email as well', () => {
    const result = validateMemberInput({ ...validInput, email: 'a<b@c.d' })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.fields.email).toMatch(/html tags|format/i)
    }
  })

  it('companion: enforces field length caps', () => {
    const result = validateMemberInput({ ...validInput, job_title: 'X'.repeat(101) })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.fields.job_title).toMatch(/at most 100 characters/i)
    }
  })
})
