/**
 * Dependency-injection registry for the MemberRepository.
 *
 * Wired in `feat/members-api-repository` (build step 4):
 *   - createMemberRepository(): singleton, defaults to ApiMemberRepository
 *   - setMemberRepository(repo | null): test seam to inject an in-memory/mock
 *
 * Kept as a stub until the MemberRepository interface exists (step 2).
 */
export {}
