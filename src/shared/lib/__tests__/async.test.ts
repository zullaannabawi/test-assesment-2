import { describe, it, expect, vi } from 'vitest'
import { delay } from '../async'

describe('shared/lib/async', () => {
  it('resolves after the requested milliseconds', async () => {
    vi.useFakeTimers()
    try {
      const promise = delay(300)
      const settled = vi.fn()
      promise.then(settled)

      await vi.advanceTimersByTimeAsync(299)
      expect(settled).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1)
      await promise
      expect(settled).toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })
})
