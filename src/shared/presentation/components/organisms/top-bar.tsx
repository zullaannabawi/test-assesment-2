import { User } from 'lucide-react'

/**
 * Static profile bar spanning the top of the app (per design
 * member-list-normal.png). Mock identity — no auth in this phase.
 */
export function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar__profile">
        <span className="top-bar__avatar">
          <User size={20} aria-hidden="true" />
        </span>
        <span className="top-bar__identity">
          <span className="top-bar__name">Alex Vance</span>
          <span className="top-bar__role">Lead Architect</span>
        </span>
      </div>
    </header>
  )
}
