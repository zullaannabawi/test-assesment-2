import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  subTone?: 'info' | 'warning'
  icon?: ReactNode
}

/** KPI card per design: uppercase label + icon chip, big value, sub-label pill. */
export function StatCard({ label, value, subLabel, subTone = 'info', icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <p className="stat-card__label">{label}</p>
        {icon ? <span className="stat-card__icon">{icon}</span> : null}
      </div>
      <p className="stat-card__value">{value}</p>
      {subLabel ? (
        <span className={`stat-card__sub stat-card__sub--${subTone}`}>{subLabel}</span>
      ) : null}
    </div>
  )
}
