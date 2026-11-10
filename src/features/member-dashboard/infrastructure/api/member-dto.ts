/**
 * Wire format of the member API (snake_case, per the REST contract).
 * Fields are plain strings here — the mapper narrows enum-shaped fields into
 * the domain types at the boundary.
 */
export interface MemberActivityDto {
  repositories: number
  deployments: number
}

export interface MemberDto {
  id: number
  full_name: string
  email: string
  job_title: string
  department: string
  account_status: string
  employment_type: string
  bio: string | null
  /** 'YYYY-MM-DD' */
  joined_at: string
  activity: MemberActivityDto
}
