'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '../atoms/button'
import { Text } from '../atoms/text'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Destructive-action confirmation — shown before any delete call. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null
  }
  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <AlertTriangle className="modal__icon modal__icon--danger" size={36} aria-hidden="true" />
        <Text as="h2" size="lg" weight="semibold">
          {title}
        </Text>
        {description ? (
          <Text size="sm" className="modal__description">
            {description}
          </Text>
        ) : null}
        <div className="modal__actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
