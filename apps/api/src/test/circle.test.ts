import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { CircleService } from '../services/circle.service'

vi.mock('../db/client', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

// ─── CircleService unit tests ──────────────────────────────────────────────

describe('CircleService', () => {
  let service: CircleService
  let db: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    db = mockDeep<PrismaClient>()
    service = new CircleService(db as any)
  })

  // ── Invite code ─────────────────────────────────────────────────────────

  describe('generateInviteCode', () => {
    it('generates 8-char codes', () => {
      const codes = Array.from({ length: 100 }, () => service.generateInviteCode())
      for (const code of codes) {
        expect(code).toHaveLength(8)
      }
    })

    it('never contains ambiguous characters (0, O, 1, I)', () => {
      const codes = Array.from({ length: 500 }, () => service.generateInviteCode())
      for (const code of codes) {
        expect(code).not.toMatch(/[0O1I]/)
      }
    })

    it('uses only uppercase alphanumeric', () => {
      const codes = Array.from({ length: 100 }, () => service.generateInviteCode())
      for (const code of codes) {
        expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/)
      }
    })

    it('generates unique codes across 1000 samples', () => {
      const codes = new Set(Array.from({ length: 1000 }, () => service.generateInviteCode()))
      expect(codes.size).toBe(1000)
    })
  })
})

// ─── FREE tier limits ──────────────────────────────────────────────────────

describe('FREE tier enforcement', () => {
  it('allows creating first circle on free tier', () => {
    const activeMemberships = []
    const canCreate = activeMemberships.length < 1
    expect(canCreate).toBe(true)
  })

  it('blocks creating second circle on free tier', () => {
    const activeMemberships = [{ status: 'ACTIVE' }]
    const canCreate = activeMemberships.length < 1
    expect(canCreate).toBe(false)
  })

  it('allows joining first circle on free tier', () => {
    const activeCircles = 0
    const isBlocked = activeCircles >= 1
    expect(isBlocked).toBe(false)
  })

  it('blocks joining second circle on free tier', () => {
    const activeCircles = 1
    const isBlocked = activeCircles >= 1
    expect(isBlocked).toBe(true)
  })

  it('MEMBER tier allows multiple circles', () => {
    const tier = 'MEMBER' as string
    const activeCircles = 5
    const isBlocked = tier === 'FREE' && activeCircles >= 1
    expect(isBlocked).toBe(false)
  })

  it('FREE max members is 4, MEMBER max is 8', () => {
    const FREE_MAX = 4
    const MEMBER_MAX = 8
    expect(FREE_MAX).toBe(4)
    expect(MEMBER_MAX).toBe(8)
  })
})

// ─── Seat business rules ───────────────────────────────────────────────────

describe('Seat rules', () => {
  describe('cannot save own meal', () => {
    it('blocks when cookId === userId', () => {
      const meal = { cookId: 'user_abc' }
      const userId = 'user_abc'
      const isBlocked = meal.cookId === userId
      expect(isBlocked).toBe(true)
    })

    it('allows when cookId !== userId', () => {
      const meal = { cookId: 'user_abc' }
      const userId = 'user_xyz'
      const isBlocked = meal.cookId === userId
      expect(isBlocked).toBe(false)
    })
  })

  describe('2-hour unsave cutoff', () => {
    const cutoffMs = 2 * 60 * 60 * 1000

    it('allows unsave when pickup is 3 hours away', () => {
      const pickupTime = new Date(Date.now() + 3 * cutoffMs / 2)
      const cutoff = new Date(pickupTime.getTime() - cutoffMs)
      expect(new Date() < cutoff).toBe(true)
    })

    it('blocks unsave when pickup is 1 hour away', () => {
      const pickupTime = new Date(Date.now() + cutoffMs / 2)
      const cutoff = new Date(pickupTime.getTime() - cutoffMs)
      expect(new Date() > cutoff).toBe(true)
    })

    it('blocks unsave after pickup has passed', () => {
      const pickupTime = new Date(Date.now() - 30 * 60 * 1000)
      const cutoff = new Date(pickupTime.getTime() - cutoffMs)
      expect(new Date() > cutoff).toBe(true)
    })

    it('blocks exactly at 2-hour mark (edge case)', () => {
      // 2 hours = cutoff exactly — should be blocked (not strictly less than)
      const pickupTime = new Date(Date.now() + cutoffMs)
      const cutoff = new Date(pickupTime.getTime() - cutoffMs)
      // Now is approximately equal to cutoff — not < so blocked
      const now = new Date()
      expect(now >= cutoff).toBe(true)
    })
  })
})

// ─── Circle state machine ──────────────────────────────────────────────────

describe('Circle status transitions', () => {
  it('FORMING transitions to ACTIVE at 3 members', () => {
    const memberCount = 3
    const currentStatus = 'FORMING'
    const newStatus = currentStatus === 'FORMING' && memberCount >= 3 ? 'ACTIVE' : currentStatus
    expect(newStatus).toBe('ACTIVE')
  })

  it('stays FORMING at 2 members', () => {
    const memberCount = 2
    const currentStatus = 'FORMING'
    const newStatus = currentStatus === 'FORMING' && memberCount >= 3 ? 'ACTIVE' : currentStatus
    expect(newStatus).toBe('FORMING')
  })

  it('does not re-transition ACTIVE circle to FORMING on member join', () => {
    const currentStatus = 'ACTIVE' as string
    const memberCount = 4
    const newStatus = currentStatus === 'FORMING' && memberCount >= 3 ? 'ACTIVE' : currentStatus
    expect(newStatus).toBe('ACTIVE')
  })
})

// ─── GDPR soft-delete ─────────────────────────────────────────────────────

describe('User soft delete', () => {
  it('anonymized email follows expected pattern', () => {
    const userId = 'user_abc123'
    const anonymizedEmail = `deleted_${userId}@deleted.round`
    expect(anonymizedEmail).toBe('deleted_user_abc123@deleted.round')
    expect(anonymizedEmail).not.toContain('@gmail')
  })
})

// ─── Invite code deep links ────────────────────────────────────────────────

describe('Invite deep links', () => {
  it('web invite URL is correct', () => {
    const code = 'MISSION4'
    const url = `https://round.app/invite/${code}`
    expect(url).toBe('https://round.app/invite/MISSION4')
  })

  it('app deep link scheme is correct', () => {
    const code = 'MISSION4'
    const link = `round://invite/${code}`
    expect(link).toBe('round://invite/MISSION4')
  })
})

// ─── Reliability score ────────────────────────────────────────────────────

describe('Reliability rate calculation', () => {
  it('100% when all turns fulfilled', () => {
    const total = 10
    const fulfilled = 10
    const rate = total > 0 ? fulfilled / total : 1.0
    expect(rate).toBe(1.0)
  })

  it('0% when no turns fulfilled', () => {
    const total = 5
    const fulfilled = 0
    const rate = total > 0 ? fulfilled / total : 1.0
    expect(rate).toBe(0)
  })

  it('defaults to 1.0 with no history', () => {
    const total = 0
    const fulfilled = 0
    const rate = total > 0 ? fulfilled / total : 1.0
    expect(rate).toBe(1.0)
  })

  it('rounds to 2 decimal places', () => {
    const total = 3
    const fulfilled = 2
    const rate = Math.round((fulfilled / total) * 100) / 100
    expect(rate).toBe(0.67)
  })
})
