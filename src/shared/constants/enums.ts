/**
 * Presentation-layer re-export of the member domain enums, so UI code imports
 * from `@/shared/constants/enums` instead of reaching into a feature folder.
 */
export {
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  ACCOUNT_STATUSES,
  type Department,
  type EmploymentType,
  type AccountStatus,
} from '@/features/member-dashboard/domain/member'
