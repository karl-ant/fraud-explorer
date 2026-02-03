import { getRiskScore, getRiskLevel, getRiskBadgeConfig, getRiskBarColor, RiskLevel } from './risk-utils'
import { TransactionData } from '@/types'

const makeTransaction = (riskScore?: string): TransactionData => ({
  id: 'test_1',
  amount: 1000,
  currency: 'usd',
  status: 'succeeded',
  created: Math.floor(Date.now() / 1000),
  metadata: riskScore !== undefined ? { risk_score: riskScore } : undefined,
})

describe('risk-utils', () => {
  describe('getRiskScore', () => {
    it('should parse numeric risk score from metadata', () => {
      expect(getRiskScore(makeTransaction('85'))).toBe(85)
    })

    it('should return 0 for missing metadata', () => {
      expect(getRiskScore(makeTransaction())).toBe(0)
    })

    it('should return 0 for non-numeric risk score', () => {
      expect(getRiskScore(makeTransaction('invalid'))).toBe(0)
    })

    it('should handle leading zeros correctly', () => {
      expect(getRiskScore(makeTransaction('08'))).toBe(8)
    })
  })

  describe('getRiskLevel', () => {
    it('should return critical for scores >= 85', () => {
      expect(getRiskLevel(85)).toBe('critical')
      expect(getRiskLevel(99)).toBe('critical')
      expect(getRiskLevel(100)).toBe('critical')
    })

    it('should return high for scores 70-84', () => {
      expect(getRiskLevel(70)).toBe('high')
      expect(getRiskLevel(84)).toBe('high')
    })

    it('should return medium for scores 40-69', () => {
      expect(getRiskLevel(40)).toBe('medium')
      expect(getRiskLevel(69)).toBe('medium')
    })

    it('should return low for scores < 40', () => {
      expect(getRiskLevel(0)).toBe('low')
      expect(getRiskLevel(39)).toBe('low')
    })

    it('should handle boundary values exactly', () => {
      expect(getRiskLevel(39)).toBe('low')
      expect(getRiskLevel(40)).toBe('medium')
      expect(getRiskLevel(69)).toBe('medium')
      expect(getRiskLevel(70)).toBe('high')
      expect(getRiskLevel(84)).toBe('high')
      expect(getRiskLevel(85)).toBe('critical')
    })
  })

  describe('getRiskBadgeConfig', () => {
    it('should return correct label for each level', () => {
      expect(getRiskBadgeConfig('critical').label).toBe('CRIT')
      expect(getRiskBadgeConfig('high').label).toBe('HIGH')
      expect(getRiskBadgeConfig('medium').label).toBe('MED')
      expect(getRiskBadgeConfig('low').label).toBe('LOW')
    })

    it('should return classNames containing the correct risk token', () => {
      const levels: RiskLevel[] = ['critical', 'high', 'medium', 'low']
      levels.forEach(level => {
        const config = getRiskBadgeConfig(level)
        expect(config.className).toContain(`risk-${level}-bg`)
        expect(config.className).toContain(`risk-${level}-border`)
        expect(config.className).toContain(`risk-${level}-text`)
      })
    })
  })

  describe('getRiskBarColor', () => {
    it('should return CSS variable class for each level', () => {
      expect(getRiskBarColor('critical')).toContain('risk-critical-text')
      expect(getRiskBarColor('high')).toContain('risk-high-text')
      expect(getRiskBarColor('medium')).toContain('risk-medium-text')
      expect(getRiskBarColor('low')).toContain('risk-low-text')
    })
  })
})
