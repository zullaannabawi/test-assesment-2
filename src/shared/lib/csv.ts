import type { AccountStatus } from '@/features/member-list/domain/member'
import { formatDate, shortStatus } from './formatters'

/**
 * CSV export of the displayed member rows (SH-07..08).
 * Contract header, short status, formatted join date, RFC 4180 escaping.
 */

/** One exported member row — snake_case mirrors the API entity fields. */
export interface MemberCsvRow {
  full_name: string
  email: string
  job_title: string
  department: string
  account_status: AccountStatus
  joined_at: string
}

const CSV_HEADER = ['Full Name', 'Email', 'Job Title', 'Department', 'Status', 'Joined Date'] as const

/** RFC 4180: wrap a field in quotes when it has a comma, quote or newline; inner quotes are doubled. */
function escapeCsvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function toCsv(rows: readonly MemberCsvRow[]): string {
  const lines = rows.map((row) =>
    [
      row.full_name,
      row.email,
      row.job_title,
      row.department,
      shortStatus(row.account_status),
      formatDate(row.joined_at),
    ]
      .map(escapeCsvField)
      .join(','),
  )
  return [CSV_HEADER.join(','), ...lines].join('\n')
}

/** DOM side effect (untested): trigger a browser download of the CSV string. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
