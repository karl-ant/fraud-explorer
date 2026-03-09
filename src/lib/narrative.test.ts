import { TransactionData, FraudPattern } from '@/types'
import { buildNarrativeSummary, computePatternExposure } from './narrative'

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

describe('computePatternExposure', () => {
  it('should sum amounts of affected transactions', () => {
    const txns = [
      makeTxn({ id: 't1', amount: 1000 }),
      makeTxn({ id: 't2', amount: 2000 }),
      makeTxn({ id: 't3', amount: 5000 }),
    ]
    const pattern = makePattern({ affected_transactions: ['t1', 't3'] })
    expect(computePatternExposure(pattern, txns)).toBe(6000)
  })

  it('should return 0 when no transactions match', () => {
    const txns = [makeTxn({ id: 't1', amount: 1000 })]
    const pattern = makePattern({ affected_transactions: ['nonexistent'] })
    expect(computePatternExposure(pattern, txns)).toBe(0)
  })

  it('should return 0 for empty affected list', () => {
    const txns = [makeTxn({ id: 't1', amount: 1000 })]
    const pattern = makePattern({ affected_transactions: [] })
    expect(computePatternExposure(pattern, txns)).toBe(0)
  })
})

describe('buildNarrativeSummary', () => {
  describe('no patterns (clean data)', () => {
    it('should produce a reassuring summary with volume and success rate', () => {
      const txns = [
        makeTxn({ amount: 10000, status: 'succeeded' }),
        makeTxn({ amount: 20000, status: 'succeeded' }),
        makeTxn({ amount: 5000, status: 'failed' }),
        makeTxn({ amount: 15000, status: 'succeeded' }),
      ]
      const summary = buildNarrativeSummary(txns, [])
      expect(summary).toContain('Scanned 4 transactions')
      expect(summary).toContain('no fraud signals detected')
      expect(summary).toContain('$500') // total volume = 50000 cents = $500
      expect(summary).toContain('75% success rate')
    })

    it('should handle empty transaction list', () => {
      const summary = buildNarrativeSummary([], [])
      expect(summary).toContain('Scanned 0 transactions')
      expect(summary).toContain('no fraud signals detected')
      expect(summary).toContain('$0')
      expect(summary).toContain('0% success rate')
    })
  })

  describe('with patterns (lead sentence per type)', () => {
    it('should lead with card_testing pattern', () => {
      const txns = [
        makeTxn({ id: 'a', amount: 100, created: 1700000000 }),
        makeTxn({ id: 'b', amount: 150, created: 1700000060 }),
        makeTxn({ id: 'c', amount: 200, created: 1700000120 }),
      ]
      const pattern = makePattern({
        type: 'card_testing',
        risk_level: 'critical',
        affected_transactions: ['a', 'b', 'c'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('🚨')
      expect(summary).toContain('CRITICAL')
      expect(summary).toContain('Card testing attack')
      expect(summary).toContain('3 micro-charge probes')
      expect(summary).toContain('2 min') // 120 seconds
    })

    it('should lead with retry_attack breakthrough', () => {
      const txns = [
        makeTxn({ id: 'f1', amount: 25000, status: 'failed' }),
        makeTxn({ id: 'f2', amount: 25000, status: 'failed' }),
        makeTxn({ id: 's1', amount: 240000, status: 'succeeded', customer: 'cus_retry_0' }),
      ]
      const pattern = makePattern({
        type: 'retry_attack',
        risk_level: 'critical',
        affected_transactions: ['f1', 'f2', 's1'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('CRITICAL')
      expect(summary).toContain('Card cracking succeeded')
      expect(summary).toContain('2 failed probes')
      expect(summary).toContain('$2,400 breakthrough')
      expect(summary).toContain('cus_retry_0')
    })

    it('should lead with velocity_fraud spike', () => {
      const txns = [
        makeTxn({ id: 'v1', customer: 'cus_vel_0' }),
        makeTxn({ id: 'v2', customer: 'cus_vel_0' }),
        makeTxn({ id: 'v3', customer: 'cus_vel_0' }),
      ]
      const pattern = makePattern({
        type: 'velocity_fraud',
        risk_level: 'high',
        affected_transactions: ['v1', 'v2', 'v3'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('HIGH')
      expect(summary).toContain('Velocity spike')
      expect(summary).toContain('3 transactions in 30 min')
      expect(summary).toContain('cus_vel_0')
    })

    it('should lead with high_risk_geography with dollar total', () => {
      const txns = [
        makeTxn({ id: 'g1', amount: 100000, metadata: { country: 'NG' } }),
        makeTxn({ id: 'g2', amount: 200000, metadata: { country: 'PK' } }),
      ]
      const pattern = makePattern({
        type: 'high_risk_geography',
        risk_level: 'high',
        affected_transactions: ['g1', 'g2'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('HIGH')
      expect(summary).toContain('$3,000 from high-risk regions')
      expect(summary).toContain('NG')
      expect(summary).toContain('PK')
    })

    it('should lead with cryptocurrency_fraud noting anonymous sources', () => {
      const txns = [
        makeTxn({ id: 'c1', amount: 500000, metadata: { country: 'VPN' } }),
        makeTxn({ id: 'c2', amount: 300000, customer: undefined }),
      ]
      const pattern = makePattern({
        type: 'cryptocurrency_fraud',
        risk_level: 'critical',
        affected_transactions: ['c1', 'c2'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('CRITICAL')
      expect(summary).toContain('$8,000 in crypto exchange activity')
      expect(summary).toContain('anonymous sources')
    })

    it('should lead with off_hours_fraud', () => {
      const txns = [
        makeTxn({ id: 'o1', amount: 50000, metadata: { country: 'RU' } }),
        makeTxn({ id: 'o2', amount: 30000, metadata: { country: 'CN' } }),
      ]
      const pattern = makePattern({
        type: 'off_hours_fraud',
        risk_level: 'high',
        affected_transactions: ['o1', 'o2'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('HIGH')
      expect(summary).toContain('2 off-hours transactions')
      expect(summary).toContain('$800')
    })

    it('should lead with high_value_international', () => {
      const txns = [
        makeTxn({ id: 'h1', amount: 600000, metadata: { country: 'RO' } }),
        makeTxn({ id: 'h2', amount: 900000, metadata: { country: 'CN' } }),
      ]
      const pattern = makePattern({
        type: 'high_value_international',
        risk_level: 'high',
        affected_transactions: ['h1', 'h2'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('HIGH')
      expect(summary).toContain('2 high-value international transactions')
      expect(summary).toContain('$15,000')
    })

    it('should lead with round_number_fraud', () => {
      const txns = [
        makeTxn({ id: 'r1', amount: 500000 }),
        makeTxn({ id: 'r2', amount: 1000000 }),
      ]
      const pattern = makePattern({
        type: 'round_number_fraud',
        risk_level: 'medium',
        affected_transactions: ['r1', 'r2'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('MEDIUM')
      expect(summary).toContain('2 suspiciously round amounts')
      expect(summary).toContain('$15,000')
    })

    it('should fall back to pattern description for unknown types', () => {
      const txns = [makeTxn({ id: 'x1' })]
      const pattern = makePattern({
        type: 'some_new_pattern',
        risk_level: 'high',
        description: 'Novel fraud scheme detected',
        affected_transactions: ['x1'],
      })
      const summary = buildNarrativeSummary(txns, [pattern])
      expect(summary).toContain('Novel fraud scheme detected')
    })
  })

  describe('severity ordering', () => {
    it('should lead with critical pattern over high pattern', () => {
      const txns = [
        makeTxn({ id: 'a', amount: 100 }),
        makeTxn({ id: 'b', amount: 200 }),
      ]
      const patterns = [
        makePattern({ type: 'velocity_fraud', risk_level: 'high', affected_transactions: ['a'] }),
        makePattern({ type: 'card_testing', risk_level: 'critical', affected_transactions: ['b'] }),
      ]
      const summary = buildNarrativeSummary(txns, patterns)
      // First mention should be the critical card_testing, not the high velocity
      expect(summary.indexOf('CRITICAL')).toBeLessThan(summary.indexOf('at risk'))
      expect(summary).toContain('Card testing')
    })

    it('should lead with high pattern over medium pattern', () => {
      const txns = [makeTxn({ id: 'a' }), makeTxn({ id: 'b' })]
      const patterns = [
        makePattern({ type: 'round_number_fraud', risk_level: 'medium', affected_transactions: ['a'] }),
        makePattern({ type: 'velocity_fraud', risk_level: 'high', affected_transactions: ['b'] }),
      ]
      const summary = buildNarrativeSummary(txns, patterns)
      expect(summary).toContain('HIGH: Velocity spike')
    })
  })

  describe('aggregate exposure', () => {
    it('should compute total at-risk across all patterns with severity counts', () => {
      const txns = [
        makeTxn({ id: 't1', amount: 100000 }),
        makeTxn({ id: 't2', amount: 200000 }),
        makeTxn({ id: 't3', amount: 300000 }),
        makeTxn({ id: 't4', amount: 400000 }),
      ]
      const patterns = [
        makePattern({ type: 'card_testing', risk_level: 'critical', affected_transactions: ['t1', 't2'] }),
        makePattern({ type: 'velocity_fraud', risk_level: 'high', affected_transactions: ['t3'] }),
      ]
      const summary = buildNarrativeSummary(txns, patterns)
      expect(summary).toContain('$6,000 at risk across 2 patterns')
      expect(summary).toContain('(1 critical, 1 high)')
      expect(summary).toContain('4 transactions scanned')
    })

    it('should dedup overlapping affected transactions in exposure total', () => {
      const txns = [
        makeTxn({ id: 't1', amount: 100000 }),
        makeTxn({ id: 't2', amount: 200000 }),
      ]
      const patterns = [
        makePattern({ type: 'card_testing', risk_level: 'critical', affected_transactions: ['t1', 't2'] }),
        makePattern({ type: 'velocity_fraud', risk_level: 'high', affected_transactions: ['t2'] }),
      ]
      const summary = buildNarrativeSummary(txns, patterns)
      // t2 overlaps but should only count once: $1000 + $2000 = $3000
      expect(summary).toContain('$3,000 at risk')
    })

    it('should use singular "pattern" for single pattern', () => {
      const txns = [makeTxn({ id: 't1', amount: 1000 })]
      const patterns = [
        makePattern({ type: 'card_testing', risk_level: 'critical', affected_transactions: ['t1'] }),
      ]
      const summary = buildNarrativeSummary(txns, patterns)
      expect(summary).toContain('1 pattern')
      expect(summary).not.toContain('1 patterns')
    })
  })
})
