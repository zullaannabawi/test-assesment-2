import type { Member, MemberStats } from './member'

/**
 * Derives the KPI stats from a member list (pure).
 * Shared by the in-memory repository and the mock `/api/members/stats` route.
 *
 * `pending_invites` / `expiring_soon` are display-only constants agreed with
 * the team — there is no invite flow in this phase.
 */
export function computeMemberStats(
  members: readonly Member[],
  today: Date = new Date(),
  pendingInvites = 5,
  expiringSoon = 3,
): MemberStats {
  const total = members.length
  const active = members.filter((m) => m.account_status.startsWith('Active'))
  const activeNow = active.length
  const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  return {
    total_members: total,
    new_this_month: members.filter((m) => m.joined_at.startsWith(monthPrefix)).length,
    active_now: activeNow,
    activity_rate: total === 0 ? 0 : Math.round((activeNow / total) * 100),
    departments: new Set(members.map((m) => m.department)).size,
    active_units: new Set(active.map((m) => m.department)).size,
    pending_invites: pendingInvites,
    expiring_soon: expiringSoon,
  }
}
