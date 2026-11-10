import { avatarInitials } from '@/shared/lib/formatters'

interface AvatarProps {
  name: string
  className?: string
}

/** Circular avatar with the initials derived from the full name (never stored). */
export function Avatar({ name, className = '' }: AvatarProps) {
  return (
    <span className={`avatar ${className}`.trim()} aria-hidden="true">
      {avatarInitials(name)}
    </span>
  )
}
