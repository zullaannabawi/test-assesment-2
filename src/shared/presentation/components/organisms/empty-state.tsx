import { SearchX } from 'lucide-react'
import { Button } from '../atoms/button'
import { Text } from '../atoms/text'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = 'No members found',
  description = 'Try adjusting your search to find what you are looking for.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <SearchX className="empty-state__icon" size={28} aria-hidden="true" />
      <Text as="h3" size="lg" weight="semibold" className="empty-state__title">
        {title}
      </Text>
      <Text size="sm" className="empty-state__description">
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
