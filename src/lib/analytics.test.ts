import { TransactionData, FraudPattern } from '@/types'
import {
  computeStatusDistribution,
  computeProcessorBreakdown,
  computeVolumeByDay,
  computeFraudSummary,
  computeOverviewStats,
} from './analytics'

function makeTxn(overrides: Partial<TransactionData> = {}): TransactionData {
  return {
    id: `txn_${Math.random().toString(36).slice(2, 10)}`,
    amount: 1000,
    currency: 'usd',
    status: 'succeeded',
    created: 1700000000,
    ...overrides,
  }
}

function makePattern(overrides: Partial<FraudPattern> = {}): FraudPattern {
  return {
    type: 'card_testing',
    description: 'Test pattern',
    risk_level: 'high',
    indicators: ['indicator1'],
    affected_transactions: [],
    recommendation: 'Review',
    ...overrides,
  }
}

describe('computeStatusDistribution', () => {
  it('should return empty array for no transactions', () => {
    expect(computeStatusDistribution([])).toEqual([])
  })

  it('should count each status correctly', () => {
    const txns = [
      makeTxn({ status: 'succeeded' }),
      makeTxn({ status: 'succeeded' }),
      makeTxn({ status: 'failed' }),
      makeTxn({ status: 'pending' }),
    ]
    const result = computeStatusDistribution(txns)
    expect(result).toHaveLength(3)

    const succeeded = result.find(r => r.status === 'succeeded')!
    expect(succeeded.count).toBe(2)
    expect(succeeded.percentage).toBe(50)

    const failed = result.find(r => r.status === 'failed')!
    expect(failed.count).toBe(1)
    expect(failed.percentage).toBe(25)
  })

  it('should handle single status', () => {
    const txns = [makeTxn({ status: 'failed' }), makeTxn({ status: 'failed' })]
    const result = computeStatusDistribution(txns)
    expect(result).toHaveLength(1)
    expect(result[0].percentage).toBe(100)
  })
})

describe('computeProcessorBreakdown', () => {
  it('should return empty array for no transactions', () => {
    expect(computeProcessorBreakdown([])).toEqual([])
  })

  it('should group by processor with correct volumes', () => {
    const txns = [
      makeTxn({ processor: 'stripe', amount: 1000 }),
      makeTxn({ processor: 'stripe', amount: 2000 }),
      makeTxn({ processor: 'paypal', amount: 500 }),
    ]
    const result = computeProcessorBreakdown(txns)
    expect(result).toHaveLength(2)

    const stripe = result.find(r => r.processor === 'stripe')!
    expect(stripe.count).toBe(2)
    expect(stripe.volume).toBe(3000)

    const paypal = result.find(r => r.processor === 'paypal')!
    expect(paypal.count).toBe(1)
    expect(paypal.volume).toBe(500)
  })

  it('should handle transactions without processor as unknown', () => {
    const txns = [makeTxn({ processor: undefined })]
    const result = computeProcessorBreakdown(txns)
    expect(result[0].processor).toBe('unknown')
  })
})

describe('computeVolumeByDay', () => {
  it('should return empty array for no transactions', () => {
    expect(computeVolumeByDay([])).toEqual([])
  })

  it('should group transactions by day', () => {
    // Two transactions on the same day, one on a different day
    const day1 = Math.floor(new Date('2024-01-15T10:00:00Z').getTime() / 1000)
    const day1b = Math.floor(new Date('2024-01-15T22:00:00Z').getTime() / 1000)
    const day2 = Math.floor(new Date('2024-01-16T10:00:00Z').getTime() / 1000)

    const txns = [
      makeTxn({ created: day1, amount: 1000 }),
      makeTxn({ created: day1b, amount: 2000 }),
      makeTxn({ created: day2, amount: 500 }),
    ]
    const result = computeVolumeByDay(txns)
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2024-01-15')
    expect(result[0].count).toBe(2)
    expect(result[0].volume).toBe(3000)
    expect(result[1].date).toBe('2024-01-16')
    expect(result[1].count).toBe(1)
  })

  it('should sort by date ascending', () => {
    const day1 = Math.floor(new Date('2024-03-01T10:00:00Z').getTime() / 1000)
    const day2 = Math.floor(new Date('2024-01-01T10:00:00Z').getTime() / 1000)

    const txns = [
      makeTxn({ created: day1 }),
      makeTxn({ created: day2 }),
    ]
    const result = computeVolumeByDay(txns)
    expect(result[0].date).toBe('2024-01-01')
    expect(result[1].date).toBe('2024-03-01')
  })
})

describe('computeFraudSummary', () => {
  it('should return empty array for no patterns', () => {
    expect(computeFraudSummary([], [])).toEqual([])
  })

  it('should map pattern data correctly', () => {
    const patterns = [
      makePattern({ type: 'card_testing', risk_level: 'critical', affected_transactions: ['t1', 't2', 't3'] }),
      makePattern({ type: 'velocity_fraud', risk_level: 'high', affected_transactions: ['t4'] }),
    ]
    const result = computeFraudSummary([], patterns)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ patternType: 'card_testing', count: 3, riskLevel: 'critical' })
    expect(result[1]).toEqual({ patternType: 'velocity_fraud', count: 1, riskLevel: 'high' })
  })
})

describe('computeOverviewStats', () => {
  it('should return zeros for empty input', () => {
    const result = computeOverviewStats([])
    expect(result).toEqual({ total: 0, volume: 0, avgAmount: 0, fraudRate: 0 })
  })

  it('should compute total, volume, and average correctly', () => {
    const txns = [
      makeTxn({ amount: 1000 }),
      makeTxn({ amount: 3000 }),
      makeTxn({ amount: 2000 }),
    ]
    const result = computeOverviewStats(txns)
    expect(result.total).toBe(3)
    expect(result.volume).toBe(6000)
    expect(result.avgAmount).toBe(2000)
  })

  it('should compute fraud rate based on affected transactions', () => {
    const txns = [
      makeTxn({ id: 't1' }),
      makeTxn({ id: 't2' }),
      makeTxn({ id: 't3' }),
      makeTxn({ id: 't4' }),
    ]
    const patterns = [
      makePattern({ affected_transactions: ['t1', 't2'] }),
      makePattern({ affected_transactions: ['t2', 't3'] }), // t2 overlaps
    ]
    const result = computeOverviewStats(txns, patterns)
    // unique affected: t1, t2, t3 = 3 out of 4
    expect(result.fraudRate).toBe(75)
  })

  it('should handle no patterns gracefully', () => {
    const txns = [makeTxn()]
    const result = computeOverviewStats(txns)
    expect(result.fraudRate).toBe(0)
  })
})
