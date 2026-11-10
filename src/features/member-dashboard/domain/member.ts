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

export interface MemberActivity {
  repositories: number
  deployments: number
}

/** The member aggregate as served by the API (snake_case mirrors the contract). */
export interface Member {
  id: number
  full_name: string
  email: string
  job_title: string
  department: Department
  account_status: AccountStatus
  employment_type: EmploymentType
  bio: string | null
  /** 'YYYY-MM-DD' — assigned by the server on create. */
  joined_at: string
  activity: MemberActivity
}

/** Create/update payload — id, joined_at and activity are server-assigned. */
export type MemberInput = Omit<Member, 'id' | 'joined_at' | 'activity'>

/** Optional list filters; `status` is the short form (`active` / `inactive`). */
export interface ListMembersFilter {
  search?: string
  status?: string
  department?: string
}

/** DELETE result partition — which ids were removed vs not found. */
export interface DeleteResult {
  deleted: number[]
  failed: number[]
}

/** KPI payload of `GET /api/members/stats`. */
export interface MemberStats {
  total_members: number
  new_this_month: number
  active_now: number
  /** Percentage of active members, rounded. */
  activity_rate: number
  departments: number
  active_units: number
  pending_invites: number
  expiring_soon: number
}
