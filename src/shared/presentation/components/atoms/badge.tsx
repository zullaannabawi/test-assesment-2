import type { HTMLAttributes } from 'react'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'sky' | 'danger' | 'warning'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

/** Pill-shaped label for departments and statuses. */
export function Badge({ tone = 'neutral', className = '', ...rest }: BadgeProps) {
  return <span className={`badge badge--${tone} ${className}`.trim()} {...rest} />
}
