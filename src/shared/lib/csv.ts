import type { AccountStatus } from '@/features/member-list/domain/member'
import { formatDate, shortStatus } from './formatters'

/** One exported member row — snake_case mirrors the API entity fields. */
export interface MemberCsvRow {
  full_name: string
  email: string
  job_title: string
  department: string
  account_status: AccountStatus
  joined_at: string
}

/** Excel export uses ';' so columns split on double-click regardless of OS locale. */
export const EXCEL_CSV_SEPARATOR = ';'

const HEADER = ['Full Name', 'Email', 'Job Title', 'Department', 'Status', 'Joined Date']

/** RFC 4180 CSV; separator defaults to the contract comma. Excel formula injection is neutralized. */
export function toCsv(rows: readonly MemberCsvRow[], separator = ','): string {
  const guard = (f: string) => (/^[=+\t@]|^-/.test(f) ? `'${f}` : f)
  const line = (fields: string[]) =>
    fields
      .map((f) => {
        const value = guard(f)
        return new RegExp(`["${separator}\\n]`).test(value)
          ? `"${value.replace(/"/g, '""')}"`
          : value
      })
      .join(separator)
  return [
    line(HEADER),
    ...rows.map((r) =>
      line([r.full_name, r.email, r.job_title, r.department, shortStatus(r.account_status), formatDate(r.joined_at)]),
    ),
  ].join('\n')
}

/** Downloads the CSV so Excel opens it with columns split: BOM + `sep=;` hint + CRLF. */
export function downloadCsv(filename: string, csv: string): void {
  const href = URL.createObjectURL(
    new Blob([`﻿sep=${EXCEL_CSV_SEPARATOR}\r\n${csv.replace(/\n/g, '\r\n')}`], {
      type: 'text/csv;charset=utf-8;',
    }),
  )
  const link = Object.assign(document.createElement('a'), { href, download: filename })
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}
