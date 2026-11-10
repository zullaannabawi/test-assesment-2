import { NextResponse } from 'next/server'

/** Uniform error envelope per the contract: `{ error: { code, message, fields? } }`. */
export function apiError(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): NextResponse {
  const error: { code: string; message: string; fields?: Record<string, string> } = {
    code,
    message,
  }
  if (fields) {
    error.fields = fields
  }
  return NextResponse.json({ error }, { status })
}
