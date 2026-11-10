import type { MemberStats } from '@/features/member-dashboard/domain/member'
import { formatNumber } from '@/shared/lib/formatters'
import { StatCard } from '../molecules/stat-card'

/** The four KPI cards (pending invites / expiring are display-only per contract). */
export function StatCardsRow({ stats }: { stats: MemberStats | null }) {
  return (
    <section className="stat-cards-row" aria-label="Member statistics">
      <StatCard label="Total Members" value={stats ? formatNumber(stats.total_members) : '—'} />
      <StatCard
        label="New This Month"
        value={stats ? formatNumber(stats.new_this_month) : '—'}
      />
      <StatCard
        label="Active Now"
        value={stats ? formatNumber(stats.active_now) : '—'}
        hint={stats ? `${stats.activity_rate}% live activity` : undefined}
      />
      <StatCard
        label="Pending Invites"
        value={stats ? formatNumber(stats.pending_invites) : '—'}
        hint={stats ? `${stats.expiring_soon} expiring soon` : undefined}
      />
    </section>
  )
}
