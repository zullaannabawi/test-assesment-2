'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'
import { formatMemberCode } from '@/shared/lib/formatters'
import { Button } from '../atoms/button'

/** Copies the display code (#MEM-2048) to the clipboard with a confirmation toast. */
export function CopyIdButton({ id }: { id: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatMemberCode(id))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <span className="copy-id">
      <Button variant="ghost" onClick={handleCopy}>
        <Copy size={14} aria-hidden="true" />
        Copy ID
      </Button>
      {copied ? (
        <span className="copy-id__toast" role="status">
          Member ID copied to clipboard
        </span>
      ) : null}
    </span>
  )
}
