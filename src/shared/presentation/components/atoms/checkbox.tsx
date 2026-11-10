'use client'

import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
}

/** Checkbox supporting the DOM-only `indeterminate` state for select-all headers. */
export function Checkbox({ indeterminate = false, className = '', ...rest }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={`checkbox ${className}`.trim()}
      ref={(el) => {
        if (el) {
          el.indeterminate = indeterminate
        }
      }}
      {...rest}
    />
  )
}
