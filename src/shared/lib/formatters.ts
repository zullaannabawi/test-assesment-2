/**
 * Pure display formatters for the Member Dashboard (SH-01..06).
 * All functions are deterministic and free of side effects / locale services.
 */

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/** `2048` → `#MEM-2048` (display code; the raw id is what travels in URLs/bodies). */
export function formatMemberCode(id: number): string {
  return `#MEM-${id}`
}

/** Two words → first letters (`Sarah Jenkins` → `SJ`); one word → first two letters (`Cher` → `CH`). */
export function avatarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return (words[0] ?? '').slice(0, 2).toUpperCase()
}

/** Derives the short pill label from a full account status value (`Active – Full Workspace Access` → `Active`). */
export function shortStatus(status: string): string {
  return status.split('–')[0].trim()
}

/** `2022-02-14` → `Feb 14, 2022`, parsed manually so no UTC shift can move the day. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${MONTHS_SHORT[month - 1]} ${day}, ${year}`
}

/** `1489` → `1,489` — deterministic thousands grouping (no ICU dependency). */
export function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
