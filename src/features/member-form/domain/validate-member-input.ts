import {
  ACCOUNT_STATUSES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '@/features/member-list/domain/member'
import type { MemberInput } from '@/features/member-list/domain/member'

export type ValidationResult =
  | { valid: true; value: MemberInput }
  | { valid: false; fields: Record<string, string> }

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/

/** Defense-in-depth: reject HTML-looking input (React already escapes on render). */
const HTML_TAG_PATTERN = /<[^>]*>/

const FIELD_LIMITS = { full_name: 100, email: 254, job_title: 100, bio: 500 } as const

type TextField = keyof typeof FIELD_LIMITS

/** HTML-tag and length-cap check for one free-text field; keeps any existing error. */
function textHardeningError(
  label: string,
  value: string | null | undefined,
  limit: number,
): string | undefined {
  if (!value) {
    return undefined // required-ness is handled separately
  }
  if (HTML_TAG_PATTERN.test(value)) {
    return `${label} must not contain HTML tags`
  }
  if (value.length > limit) {
    return `${label} must be at most ${limit} characters`
  }
  return undefined
}

/**
 * Business rules of the member form (shared by the use cases and the mock API):
 * required full_name/email/job_title/department, email format, enum membership,
 * plus HTML-tag rejection and length caps on free-text fields.
 * Optional fields fall back to the contract defaults (Active/Permanent, bio '').
 */
export function validateMemberInput(input: Partial<MemberInput>): ValidationResult {
  const fields: Record<string, string> = {}

  if (!input.full_name?.trim()) {
    fields.full_name = 'Full name is required'
  }
  if (!input.email?.trim()) {
    fields.email = 'Work email is required'
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    fields.email = 'Work email format is invalid'
  }
  if (!input.job_title?.trim()) {
    fields.job_title = 'Job title is required'
  }
  if (!input.department) {
    fields.department = 'Department is required'
  } else if (!DEPARTMENTS.includes(input.department)) {
    fields.department = 'Department value is not valid'
  }

  const labels: Record<TextField, string> = {
    full_name: 'Full name',
    email: 'Work email',
    job_title: 'Job title',
    bio: 'Bio',
  }
  for (const field of Object.keys(FIELD_LIMITS) as TextField[]) {
    const hardening = textHardeningError(labels[field], input[field], FIELD_LIMITS[field])
    if (hardening && !fields[field]) {
      fields[field] = hardening
    }
  }

  const accountStatus = input.account_status ?? ACCOUNT_STATUSES[0]
  if (!ACCOUNT_STATUSES.includes(accountStatus)) {
    fields.account_status = 'Account status value is not valid'
  }
  const employmentType = input.employment_type ?? EMPLOYMENT_TYPES[0]
  if (!EMPLOYMENT_TYPES.includes(employmentType)) {
    fields.employment_type = 'Employment type value is not valid'
  }

  if (Object.keys(fields).length > 0) {
    return { valid: false, fields }
  }

  return {
    valid: true,
    value: {
      full_name: input.full_name!.trim(),
      email: input.email!.trim(),
      job_title: input.job_title!.trim(),
      department: input.department!,
      account_status: accountStatus,
      employment_type: employmentType,
      bio: input.bio ?? '',
    },
  }
}
