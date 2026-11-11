'use client'

import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../atoms/button'
import { Text } from '../atoms/text'

interface SuccessModalProps {
  open: boolean
  title: string
  /** Rich descriptions allowed — the design mixes plain/dark/code spans. */
  description?: ReactNode
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

/** Generic success dialog — Added / Updated / Deleted (single & bulk). */
export function SuccessModal({
  open,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: SuccessModalProps) {
  if (!open) {
    return null
  }
  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <CheckCircle2 className="modal__icon" size={36} aria-hidden="true" />
        <Text as="h2" size="lg" weight="semibold">
          {title}
        </Text>
        {description ? (
          <Text as="p" size="md" className="modal__description">
            {description}
          </Text>
        ) : null}
        <div className="modal__actions">
          {secondaryLabel && onSecondary ? (
            <Button variant="secondary" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          ) : null}
          <Button variant="primary" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
