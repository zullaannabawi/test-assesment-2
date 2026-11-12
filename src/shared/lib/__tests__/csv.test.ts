import { describe, it, expect } from 'vitest'
import { toCsv, EXCEL_CSV_SEPARATOR, type MemberCsvRow } from '../csv'
import { ACCOUNT_STATUSES } from '@/shared/constants/enums'

const sarah: MemberCsvRow = {
  full_name: 'Sarah Jenkins',
  email: 'sarah.jenkins@membercore.internal',
  job_title: 'Staff Frontend Engineer',
  department: 'Engineering',
  account_status: ACCOUNT_STATUSES[0],
  joined_at: '2022-02-14',
}

describe('shared/lib/csv', () => {
  it('SH-07: toCsv renders the contract header and rows with short status and formatted date', () => {
    const csv = toCsv([sarah])
    const lines = csv.split('\n')

    expect(lines[0]).toBe('Full Name,Email,Job Title,Department,Status,Joined Date')
    expect(lines[1]).toBe(
      'Sarah Jenkins,sarah.jenkins@membercore.internal,Staff Frontend Engineer,Engineering,Active,"Feb 14, 2022"'
    )
  })

  it('SH-08: toCsv escapes fields containing commas and quotes per RFC 4180', () => {
    const tricky: MemberCsvRow = {
      ...sarah,
      full_name: 'Elena "El" Rostova, Jr.',
      job_title: 'Product Designer, UI',
    }

    const csv = toCsv([tricky])
    const line = csv.split('\n')[1]

    expect(line).toContain('"Elena ""El"" Rostova, Jr."')
    expect(line).toContain('"Product Designer, UI"')
  })

  it('companion: semicolon separator joins with ; and quotes ; -containing fields, not comma-containing ones', () => {
    const csv = toCsv([sarah], ';')
    const lines = csv.split('\n')

    expect(lines[0]).toBe('Full Name;Email;Job Title;Department;Status;Joined Date')
    // the comma inside the date is just content now — no quoting needed
    expect(lines[1]).toBe(
      'Sarah Jenkins;sarah.jenkins@membercore.internal;Staff Frontend Engineer;Engineering;Active;Feb 14, 2022'
    )

    const semicolonField = toCsv([{ ...sarah, job_title: 'Product Designer; UI' }], ';')
    expect(semicolonField.split('\n')[1]).toContain('"Product Designer; UI"')
  })

  it('companion: the Excel export separator constant is semicolon', () => {
    expect(EXCEL_CSV_SEPARATOR).toBe(';')
  })
})
