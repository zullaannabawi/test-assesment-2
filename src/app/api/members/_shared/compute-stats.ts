/**
 * Pure KPI derivation shared by the stats route and tests.
 * The rule lives in the domain layer — this re-export keeps `_shared` as the
 * import point named in the plan without duplicating logic.
 */
export { computeMemberStats as computeStats } from '@/features/member-dashboard/domain/member-stats'
