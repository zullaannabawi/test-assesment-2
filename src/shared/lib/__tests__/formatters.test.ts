import { describe, it, expect } from 'vitest'
import {
  formatMemberCode,
  avatarInitials,
  shortStatus,
  formatDate,
  formatMonthYear,
  formatNumber,
} from '../formatters'
import { ACCOUNT_STATUSES } from '@/shared/constants/enums'

describe('shared/lib/formatters', () => {
  it("SH-01: formatMemberCode renders the '#MEM-{id}' display code", () => {
    expect(formatMemberCode(2048)).toBe('#MEM-2048')
  })

  it('SH-02: avatarInitials uses the first letters of the first two words, uppercased', () => {
    expect(avatarInitials('Sarah Jenkins')).toBe('SJ')
    expect(avatarInitials('sarah jenkins')).toBe('SJ')
  })

  it('SH-03: avatarInitials falls back to the first two letters for a single word', () => {
    expect(avatarInitials('Cher')).toBe('CH')
  })

  it('SH-04: shortStatus derives the short pill label from both account status values', () => {
    expect(shortStatus(ACCOUNT_STATUSES[0])).toBe('Active')
    expect(shortStatus(ACCOUNT_STATUSES[1])).toBe('Inactive')
  })

  it('SH-05: formatDate renders the displayed date without a timezone shift', () => {
    expect(formatDate('2022-02-14')).toBe('Feb 14, 2022')
    expect(formatDate('2022-01-01')).toBe('Jan 1, 2022')
  })

  it('companion: formatMonthYear renders the full month and year (design header)', () => {
    expect(formatMonthYear('2022-03-14')).toBe('March 2022')
    expect(formatMonthYear('2022-02-14')).toBe('February 2022')
  })

  it('SH-06: formatNumber groups thousands with a comma', () => {
    expect(formatNumber(1489)).toBe('1,489')
  })
})
