import { Button } from '../atoms/button'

interface BulkActionBarProps {
  count: number
  /** Wired in the delete-flows step; the bar itself is purely derived state. */
  onDelete?: () => void
}

/** "N selected" + bulk delete — visible only while at least one row is checked. */
export function BulkActionBar({ count, onDelete }: BulkActionBarProps) {
  if (count < 1) {
    return null
  }
  return (
    <div className="bulk-action-bar" role="toolbar" aria-label="Bulk actions">
      <span className="bulk-action-bar__count">{count} selected</span>
      <Button variant="danger" onClick={onDelete} disabled={!onDelete}>
        Delete
      </Button>
    </div>
  )
}
