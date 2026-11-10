/**
 * Member domain vocabulary — enums are hardcoded on the frontend per the API
 * contract (there is no options endpoint). Values must match the API exactly;
 * `account_status` values use an EN DASH (–), so this file must stay UTF-8.
 */
export const DEPARTMENTS = ['Engineering', 'Design'] as const

export const EMPLOYMENT_TYPES = ['Full-time Permanent', 'Full-time Contract'] as const

export const ACCOUNT_STATUSES = [
  'Active – Full Workspace Access',
  'Inactive – No Workspace Access',
] as const

export type Department = (typeof DEPARTMENTS)[number]
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]
