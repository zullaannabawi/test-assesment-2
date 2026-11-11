'use client'

import type { ReactNode } from 'react'
import { CheckCircle2, Trash2 } from 'lucide-react'
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
  /**
   * 'danger' (delete popups per design): rose trash icon in a tinted chip and
   * the actions sit on a light-indigo footer strip. 'success' keeps the
   * green check layout used by the add/update popups.
   */
  tone?: 'success' | 'danger'
}

export function SuccessModal({
  open,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tone = 'success',
}: SuccessModalProps) {
  if (!open) {
    return null
  }

  const actions = (
    <>
      {secondaryLabel && onSecondary ? (
        <Button variant="secondary" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
      ) : null}
      <Button variant="primary" onClick={onPrimary}>
        {primaryLabel}
      </Button>
    </>
  )

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        {tone === 'danger' ? (
          <span className="modal__icon-chip" aria-hidden="true">
            <Trash2 size={32} strokeWidth={2} />
          </span>
        ) : (
          <CheckCircle2 className="modal__icon" size={36} aria-hidden="true" />
        )}
        <Text as="h2" size="lg" weight="semibold">
          {title}
        </Text>
        {description ? (
          <Text as="p" size="md" className="modal__description">
            {description}
          </Text>
        ) : null}

        {tone === 'danger' ? (
          <div className="modal__footer">{actions}</div>
        ) : (
          <div className="modal__actions">{actions}</div>
        )}
      </div>
    </div>
  )
}
