import { describe, it, expect, afterEach } from 'vitest'
import { createMemberRepository, setMemberRepository } from '../registry'
import { ApiMemberRepository } from '@/features/member-dashboard/infrastructure/api/api-member-repository'
import { InMemoryMemberRepository } from '@/features/member-dashboard/infrastructure/in-memory-member-repository'

afterEach(() => {
  setMemberRepository(null)
})

describe('composition registry (companion)', () => {
  it('defaults to ApiMemberRepository', () => {
    expect(createMemberRepository()).toBeInstanceOf(ApiMemberRepository)
  })

  it('caches the singleton between calls', () => {
    expect(createMemberRepository()).toBe(createMemberRepository())
  })

  it('serves an injected repository until reset with null', () => {
    const injected = new InMemoryMemberRepository([])
    setMemberRepository(injected)
    expect(createMemberRepository()).toBe(injected)

    setMemberRepository(null)
    expect(createMemberRepository()).toBeInstanceOf(ApiMemberRepository)
  })
})
