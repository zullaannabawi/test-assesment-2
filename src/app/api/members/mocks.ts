import { InMemoryMemberRepository } from '@/features/member-dashboard/infrastructure/in-memory-member-repository'
import type { Member } from '@/features/member-dashboard/domain/member'

function isoToday(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/**
 * Seed catalogue — 10 members, ids 2039–2048:
 * Sarah Jenkins = 2048 (per contract) · 8 Active / 2 Inactive ·
 * 7 Engineering / 3 Design · exactly one member joined this month (Leo, dynamic
 * date so "new this month" holds on any run date) · Sarah activity 42/1489.
 */
export const SEED_MEMBERS: readonly Member[] = [
  {
    id: 2039,
    full_name: 'Leo Martins',
    email: 'leo.martins@membercore.internal',
    job_title: 'Junior Frontend Engineer',
    department: 'Engineering',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Contract',
    bio: 'Supporting the design system migration.',
    joined_at: isoToday(),
    activity: { repositories: 3, deployments: 45 },
  },
  {
    id: 2040,
    full_name: 'Nina Petrova',
    email: 'nina.petrova@membercore.internal',
    job_title: 'Platform Engineer',
    department: 'Engineering',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Permanent',
    bio: 'Owns the CI pipelines and release tooling.',
    joined_at: '2025-04-02',
    activity: { repositories: 25, deployments: 733 },
  },
  {
    id: 2041,
    full_name: 'Tom Becker',
    email: 'tom.becker@membercore.internal',
    job_title: 'Staff UI/UX Designer',
    department: 'Design',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Permanent',
    bio: 'Design ops and component library contributor.',
    joined_at: '2024-09-16',
    activity: { repositories: 17, deployments: 288 },
  },
  {
    id: 2042,
    full_name: 'Aisha Rahman',
    email: 'aisha.rahman@membercore.internal',
    job_title: 'UX Researcher',
    department: 'Design',
    account_status: 'Inactive – No Workspace Access',
    employment_type: 'Full-time Contract',
    bio: 'Leading usability studies for the member portal.',
    joined_at: '2022-08-05',
    activity: { repositories: 11, deployments: 203 },
  },
  {
    id: 2043,
    full_name: 'James Okafor',
    email: 'james.okafor@membercore.internal',
    job_title: 'Frontend Engineer',
    department: 'Engineering',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Contract',
    bio: 'Accessibility champion across the dashboard surfaces.',
    joined_at: '2024-02-12',
    activity: { repositories: 22, deployments: 520 },
  },
  {
    id: 2044,
    full_name: 'Elena Rostova',
    email: 'elena.rostova@membercore.internal',
    job_title: 'Product Designer',
    department: 'Design',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Permanent',
    bio: 'Shapes the member onboarding experience.',
    joined_at: '2023-01-24',
    activity: { repositories: 15, deployments: 312 },
  },
  {
    id: 2045,
    full_name: 'Marcus Webb',
    email: 'marcus.webb@membercore.internal',
    job_title: 'QA Automation Engineer',
    department: 'Engineering',
    account_status: 'Inactive – No Workspace Access',
    employment_type: 'Full-time Permanent',
    bio: 'Built the end-to-end regression suite.',
    joined_at: '2021-11-30',
    activity: { repositories: 19, deployments: 410 },
  },
  {
    id: 2046,
    full_name: 'Priya Sharma',
    email: 'priya.sharma@membercore.internal',
    job_title: 'DevOps Engineer',
    department: 'Engineering',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Contract',
    bio: 'Incident response and observability lead.',
    joined_at: '2023-07-19',
    activity: { repositories: 28, deployments: 677 },
  },
  {
    id: 2047,
    full_name: 'David Chen',
    email: 'david.chen@membercore.internal',
    job_title: 'Senior Backend Engineer',
    department: 'Engineering',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Permanent',
    bio: 'Designs the member data platform services.',
    joined_at: '2023-03-06',
    activity: { repositories: 35, deployments: 942 },
  },
  {
    id: 2048,
    full_name: 'Sarah Jenkins',
    email: 'sarah.jenkins@membercore.internal',
    job_title: 'Staff Frontend Engineer',
    department: 'Engineering',
    account_status: 'Active – Full Workspace Access',
    employment_type: 'Full-time Permanent',
    bio: 'Frontend architecture lead responsible for design system integration and core web vitals.',
    joined_at: '2022-02-14',
    activity: { repositories: 42, deployments: 1489 },
  },
]

let store: InMemoryMemberRepository | null = null

/** The mutable in-memory store behind the mock API. */
export function getMemberStore(): InMemoryMemberRepository {
  if (!store) {
    store = new InMemoryMemberRepository([...SEED_MEMBERS])
  }
  return store
}

/** Test hook — restores the original 10-member seed. */
export function resetMemberStore(): void {
  store = new InMemoryMemberRepository([...SEED_MEMBERS])
}
