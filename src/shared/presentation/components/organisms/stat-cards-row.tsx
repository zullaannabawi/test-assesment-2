import { Building2, Send, Users, Zap } from 'lucide-react'
import type { MemberStats } from '@/features/member-list/domain/member'
import { formatNumber } from '@/shared/lib/formatters'
import { StatCard } from '../molecules/stat-card'

/**
 * The four KPI cards per the design:
 * Total Members (+N this month) · Active Now (% live activity) ·
 * Departments (N active units) · Pending Invites (N expiring soon, amber).
 * Pending invites / expiring are display-only per contract.
 */
export function StatCardsRow({ stats }: { stats: MemberStats | null }) {
  return (
    <section className="stat-cards-row" aria-label="Member statistics">
      <StatCard
        label="Total Members"
        value={stats ? formatNumber(stats.total_members) : '—'}
        subLabel={stats ? `+${stats.new_this_month} this month` : undefined}
        subTone="indigo"
        icon={<Users size={18} aria-hidden="true" />}
      />
      <StatCard
        label="Active Now"
        value={stats ? formatNumber(stats.active_now) : '—'}
        subLabel={stats ? `${stats.activity_rate}% live activity` : undefined}
        subTone="sky"
        icon={<Zap size={18} aria-hidden="true" />}
      />
      <StatCard
        label="Departments"
        value={stats ? formatNumber(stats.departments) : '—'}
        subLabel={stats ? `${stats.active_units} active units` : undefined}
        subTone="gray"
        icon={<Building2 size={18} aria-hidden="true" />}
      />
      <StatCard
        label="Pending Invites"
        value={stats ? formatNumber(stats.pending_invites) : '—'}
        subLabel={stats ? `${stats.expiring_soon} expiring soon` : undefined}
        subTone="amber"
        icon={<Send size={18} aria-hidden="true" />}
      />
    </section>
  )
}
