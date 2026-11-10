'use client'

import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={`input ${className}`.trim()} {...rest} />
}
