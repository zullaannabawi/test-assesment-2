import type {
  AccountStatus,
  Department,
  EmploymentType,
  Member,
} from '../../domain/member'
import type { MemberDto } from './member-dto'

/** Explicit field-by-field mapping so any contract drift breaks compilation, not runtime. */
export function toMember(dto: MemberDto): Member {
  return {
    id: dto.id,
    full_name: dto.full_name,
    email: dto.email,
    job_title: dto.job_title,
    department: dto.department as Department,
    account_status: dto.account_status as AccountStatus,
    employment_type: dto.employment_type as EmploymentType,
    bio: dto.bio,
    joined_at: dto.joined_at,
    activity: { ...dto.activity },
  }
}
