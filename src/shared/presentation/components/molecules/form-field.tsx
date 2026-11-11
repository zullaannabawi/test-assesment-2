'use client'

import { cloneElement, isValidElement, type ReactElement } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  helper?: string
  error?: string
  /** Span the full grid row instead of sharing it with another field. */
  fullWidth?: boolean
  children: ReactElement
}

/** Label + required marker + helper/error wiring (aria-describedby, aria-invalid) for one field. */
export function FormField({
  label,
  htmlFor,
  required = false,
  helper,
  error,
  fullWidth = false,
  children,
}: FormFieldProps) {
  const describedBy = [error ? `${htmlFor}-error` : null, helper ? `${htmlFor}-helper` : null]
    .filter(Boolean)
    .join(' ')

  const field = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      } as Record<string, unknown>)
    : children

  return (
    <div className={fullWidth ? 'form-field form-field--full' : 'form-field'}>
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="form-field__required" aria-hidden="true">
            {' *'}
          </span>
        ) : null}
      </label>
      {field}
      {helper && !error ? (
        <p className="form-field__helper" id={`${htmlFor}-helper`}>
          {helper}
        </p>
      ) : null}
      {error ? (
        <p className="form-field__error" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
