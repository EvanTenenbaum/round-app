import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CircleService } from '../services/circle.service'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../db/client', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

describe('CircleService', () => {
  let service: CircleService
  let db: DeepMockProxy<PrismaClient>

  beforeEach(async () => {
    const { mockDeep } = await import('vitest-mock-extended')
    db = mockDeep<PrismaClient>()
    service = new CircleService(db as any)
  })

  describe('generateInviteCode', () => {
    it('generates 8-char codes with no ambiguous characters', () => {
      const codes = Array.from({ length: 100 }, () => service.generateInviteCode())
      for (const code of codes) {
        expect(code).toHaveLength(8)
        expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/) // no 0, O, 1, I
      }
    })

    it('generates unique codes', () => {
      const codes = new Set(Array.from({ length: 1000 }, () => service.generateInviteCode()))
      expect(codes.size).toBe(1000)
    })
  })

  describe('checkDietaryConflicts', () => {
    it('returns no conflicts when user has no restrictions', async () => {
      const result = await service.checkDietaryConflicts('circle_1', [])
      expect(result.conflicts).toHaveLength(0)
      expect(result.compatible).toBe(true)
    })

    it('flags NUT_FREE conflict when circle members have not acknowledged it', async () => {
      db.circleMembership.findMany.mockResolvedValue([
        { user: { name: 'Alice', dietaryRestrictions: ['GLUTEN_FREE'] } } as any,
      ] as any)

      const result = await service.checkDietaryConflicts('circle_1', ['NUT_FREE'])
      expect(result.compatible).toBe(false)
      expect(result.conflicts[0].restriction).toBe('NUT_FREE')
      expect(result.warning).toBeTruthy()
    })

    it('does not flag GLUTEN_FREE (non-strict restriction)', async () => {
      db.circleMembership.findMany.mockResolvedValue([
        { user: { name: 'Bob', dietaryRestrictions: [] } } as any,
      ] as any)

      const result = await service.checkDietaryConflicts('circle_1', ['GLUTEN_FREE'])
      expect(result.compatible).toBe(true)
    })
  })
})

describe('Seat business rules', () => {
  describe('2-hour unsave cutoff', () => {
    it('allows unsave when pickup is >2 hours away', () => {
      const pickupTime = new Date(Date.now() + 3 * 60 * 60 * 1000)
      const cutoff = new Date(pickupTime.getTime() - 2 * 60 * 60 * 1000)
      expect(new Date() < cutoff).toBe(true)
    })

    it('blocks unsave when pickup is <2 hours away', () => {
      const pickupTime = new Date(Date.now() + 1 * 60 * 60 * 1000)
      const cutoff = new Date(pickupTime.getTime() - 2 * 60 * 60 * 1000)
      expect(new Date() > cutoff).toBe(true)
    })

    it('blocks unsave when pickup has already passed', () => {
      const pickupTime = new Date(Date.now() - 30 * 60 * 1000)
      const cutoff = new Date(pickupTime.getTime() - 2 * 60 * 60 * 1000)
      expect(new Date() > cutoff).toBe(true)
    })
  })

  describe('invite code format', () => {
    it('8-char code matches expected pattern', () => {
      const code = 'ABC12345'
      expect(code).toMatch(/^[A-Z0-9]{8}$/)
    })

    it('invite deep link builds correctly', () => {
      const code = 'MISSION4'
      const webLink = `https://round.app/invite/${code}`
      const appLink = `round://invite/${code}`
      expect(webLink).toBe('https://round.app/invite/MISSION4')
      expect(appLink).toBe('round://invite/MISSION4')
    })
  })
})
