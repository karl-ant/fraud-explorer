import { TransactionData } from '@/types'

export type ProcessorType = 'stripe' | 'paypal' | 'adyen'

export interface GeneratorConfig {
  count: number
  processors: ProcessorType[]
  dateRange: {
    start: Date
    end: Date
  }
  fraudMix: {
    cardTesting: number
    velocityFraud: number
    highRiskCountry: number
    roundNumber: number
    retryAttack: number
    cryptoFraud: number
    nightTime: number
    highValue: number
    legitimate: number
  }
  statusDistribution: {
    succeeded: number
    failed: number
    pending: number
    canceled: number
  }
}

export class MockTransactionGenerator {
  private config: GeneratorConfig

  constructor(config: GeneratorConfig) {
    // Validate count
    if (config.count < 1 || config.count > 10000) {
      throw new Error('Transaction count must be between 1 and 10,000')
    }

    // Validate processors
    if (!config.processors || config.processors.length === 0) {
      throw new Error('At least one processor must be selected')
    }

    // Validate fraud mix sums to 100%
    const fraudTotal = Object.values(config.fraudMix).reduce((sum, val) => sum + val, 0)
    if (Math.abs(fraudTotal - 100) > 0.01) {
      throw new Error(`Fraud mix percentages must sum to 100% (currently ${fraudTotal}%)`)
    }

    // Validate status distribution sums to 100%
    const statusTotal = Object.values(config.statusDistribution).reduce((sum, val) => sum + val, 0)
    if (Math.abs(statusTotal - 100) > 0.01) {
      throw new Error(`Status distribution percentages must sum to 100% (currently ${statusTotal}%)`)
    }

    // Validate date range
    if (config.dateRange.start > config.dateRange.end) {
      throw new Error('Start date must be before end date')
    }

    // Validate all percentages are non-negative
    const allPercentages = [
      ...Object.values(config.fraudMix),
      ...Object.values(config.statusDistribution)
    ]
    if (allPercentages.some(p => p < 0 || p > 100)) {
      throw new Error('All percentages must be between 0 and 100')
    }

    this.config = config
  }

  generate(): TransactionData[] {
    const allTransactions: TransactionData[] = []
    const processors = this.config.processors
    const totalCount = this.config.count

    // Split count evenly across processors, give remainder to the last one
    const perProcessor = Math.floor(totalCount / processors.length)
    const remainder = totalCount % processors.length

    processors.forEach((processor, idx) => {
      const count = perProcessor + (idx < remainder ? 1 : 0)
      if (count === 0) return

      const transactions = this.generateForProcessor(processor, count)
      allTransactions.push(...transactions)
    })

    // Apply status distribution and date range across all transactions
    this.applyStatusDistribution(allTransactions)
    this.applyDateRange(allTransactions)

    // Shuffle so processors are interleaved
    this.shuffle(allTransactions)

    return allTransactions
  }

  private generateForProcessor(processor: ProcessorType, total: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const fraudCount = Math.floor(total * (100 - this.config.fraudMix.legitimate) / 100)
    const legitimateCount = total - fraudCount

    const fraudTypes = [
      { type: 'cardTesting', pct: this.config.fraudMix.cardTesting, generator: (n: number) => this.generateCardTesting(n, processor) },
      { type: 'velocityFraud', pct: this.config.fraudMix.velocityFraud, generator: (n: number) => this.generateVelocityFraud(n, processor) },
      { type: 'highRiskCountry', pct: this.config.fraudMix.highRiskCountry, generator: (n: number) => this.generateHighRiskCountry(n, processor) },
      { type: 'roundNumber', pct: this.config.fraudMix.roundNumber, generator: (n: number) => this.generateRoundNumber(n, processor) },
      { type: 'retryAttack', pct: this.config.fraudMix.retryAttack, generator: (n: number) => this.generateRetryAttack(n, processor) },
      { type: 'cryptoFraud', pct: this.config.fraudMix.cryptoFraud, generator: (n: number) => this.generateCryptoFraud(n, processor) },
      { type: 'nightTime', pct: this.config.fraudMix.nightTime, generator: (n: number) => this.generateNightTime(n, processor) },
      { type: 'highValue', pct: this.config.fraudMix.highValue, generator: (n: number) => this.generateHighValue(n, processor) },
    ]

    const totalFraudPct = fraudTypes.reduce((sum, ft) => sum + ft.pct, 0)

    fraudTypes.forEach(fraudType => {
      if (totalFraudPct > 0) {
        const count = Math.floor(fraudCount * (fraudType.pct / totalFraudPct))
        if (count > 0) {
          transactions.push(...fraudType.generator(count))
        }
      }
    })

    if (legitimateCount > 0) {
      transactions.push(...this.generateLegitimate(legitimateCount, processor))
    }

    return transactions
  }

  private generateCardTesting(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_ct_${this.randomId()}`,
        amount: Math.floor(Math.random() * 300) + 50, // $0.50-$3.50
        currency: this.getCurrency(processor),
        status: 'failed',
        processor,
        created: now - Math.floor(Math.random() * 3600),
        customer: `cus_test_${i % 3}`,
        description: 'Card validation',
        payment_method: 'card_test',
        metadata: {
          country: 'US',
          ip_address: this.randomIP(),
          risk_score: (85 + Math.floor(Math.random() * 15)).toString(),
          fraud_indicators: 'card_testing,rapid_succession,small_amounts'
        }
      })
    }

    return transactions
  }

  private generateVelocityFraud(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_vel_${this.randomId()}`,
        amount: Math.floor(Math.random() * 5000) + 1000, // $10-$60
        currency: this.getCurrency(processor),
        status: 'succeeded',
        processor,
        created: now - Math.floor(Math.random() * 1800),
        customer: `cus_velocity_${i % 2}`,
        description: 'Digital goods purchase',
        payment_method: 'card_velocity',
        metadata: {
          country: 'US',
          ip_address: this.randomIP(),
          risk_score: (80 + Math.floor(Math.random() * 15)).toString(),
          fraud_indicators: 'velocity_fraud,same_merchant,rapid_succession',
          merchant_category: 'gaming'
        }
      })
    }

    return transactions
  }

  private generateHighRiskCountry(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const countries = ['NG', 'GH', 'ID', 'PK', 'BD', 'VN']

    for (let i = 0; i < count; i++) {
      const country = countries[i % countries.length]
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_hrisk_${this.randomId()}`,
        amount: Math.floor(Math.random() * 100000) + 50000, // $500-$1500
        currency: this.getCurrency(processor),
        status: 'succeeded',
        processor,
        created: now - Math.floor(Math.random() * 7200),
        customer: `cus_highrisk_${i}`,
        description: 'International purchase',
        payment_method: 'card_international',
        metadata: {
          country,
          ip_address: this.randomIP(),
          risk_score: (85 + Math.floor(Math.random() * 10)).toString(),
          fraud_indicators: 'high_risk_country,international_card,new_customer'
        }
      })
    }

    return transactions
  }

  private generateRoundNumber(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const roundAmounts = [500000, 1000000, 250000, 750000, 2000000]

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_round_${this.randomId()}`,
        amount: roundAmounts[i % roundAmounts.length],
        currency: this.getCurrency(processor),
        status: 'succeeded',
        processor,
        created: now - Math.floor(Math.random() * 10800),
        customer: `cus_round_${i}`,
        description: 'Business transaction',
        payment_method: 'card_business',
        metadata: {
          country: 'US',
          ip_address: this.randomIP(),
          risk_score: '65',
          fraud_indicators: 'round_amount,automated_pattern'
        }
      })
    }

    return transactions
  }

  private generateRetryAttack(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_retry_${this.randomId()}`,
        amount: 25000, // $250
        currency: this.getCurrency(processor),
        status: (i % 3 === 0 ? 'succeeded' : 'failed') as 'succeeded' | 'failed',
        processor,
        created: now - Math.floor(Math.random() * 1800),
        customer: `cus_retry_${i % 2}`,
        description: 'Subscription renewal',
        payment_method: `card_attempt_${i}`,
        metadata: {
          country: 'US',
          ip_address: this.randomIP(),
          risk_score: '80',
          fraud_indicators: 'multiple_retries,card_testing,velocity_fraud',
          attempt_number: (i + 1).toString()
        }
      })
    }

    return transactions
  }

  private generateCryptoFraud(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_crypto_${this.randomId()}`,
        amount: Math.floor(Math.random() * 500000) + 300000, // $3k-$8k
        currency: this.getCurrency(processor),
        status: 'succeeded',
        processor,
        created: now - Math.floor(Math.random() * 3600),
        customer: i % 2 === 0 ? `cus_crypto_${i}` : undefined,
        description: 'Cryptocurrency exchange',
        payment_method: 'card_crypto',
        metadata: {
          country: i % 3 === 0 ? 'VPN' : 'US',
          merchant_category: 'cryptocurrency',
          ip_address: this.randomIP(),
          risk_score: (85 + Math.floor(Math.random() * 10)).toString(),
          fraud_indicators: 'crypto_exchange,high_risk_merchant,money_laundering_risk'
        }
      })
    }

    return transactions
  }

  private generateNightTime(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const nightTime = now - (now % 86400) + (3 * 3600) // 3 AM

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_night_${this.randomId()}`,
        amount: Math.floor(Math.random() * 40000) + 10000, // $100-$500
        currency: this.getCurrency(processor),
        status: 'succeeded',
        processor,
        created: nightTime + (i * 300),
        customer: `cus_night_${i}`,
        description: 'Late night purchase',
        payment_method: 'card_stolen',
        metadata: {
          country: ['RU', 'PK', 'CN'][i % 3],
          ip_address: this.randomIP(),
          risk_score: (85 + Math.floor(Math.random() * 10)).toString(),
          fraud_indicators: 'off_hours,high_risk_country,stolen_card_pattern',
          transaction_hour: '03'
        }
      })
    }

    return transactions
  }

  private generateHighValue(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_hval_${this.randomId()}`,
        amount: Math.floor(Math.random() * 1000000) + 500000, // $5k-$15k
        currency: this.getCurrency(processor),
        status: 'succeeded',
        processor,
        created: now - Math.floor(Math.random() * 7200),
        customer: `cus_highval_${i}`,
        description: 'High-value purchase',
        payment_method: 'card_premium',
        metadata: {
          country: ['RO', 'NG', 'CN'][i % 3],
          ip_address: this.randomIP(),
          risk_score: (75 + Math.floor(Math.random() * 15)).toString(),
          fraud_indicators: 'high_value,international,new_customer'
        }
      })
    }

    return transactions
  }

  private generateLegitimate(count: number, processor: ProcessorType): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const normalAmounts = [1299, 4599, 789, 2150, 3500, 899, 1650, 5200]

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix(processor)}_legit_${this.randomId()}`,
        amount: normalAmounts[i % normalAmounts.length] * 100,
        currency: this.getCurrency(processor),
        status: 'succeeded',
        processor,
        created: now - Math.floor(Math.random() * 86400 * 7),
        customer: `cus_legit_${i}`,
        description: ['Online purchase', 'Subscription', 'Digital download', 'Service fee'][i % 4],
        payment_method: 'card_verified',
        metadata: {
          country: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'][i % 6],
          ip_address: this.randomIP(),
          risk_score: (10 + Math.floor(Math.random() * 30)).toString(),
          fraud_indicators: 'none'
        }
      })
    }

    return transactions
  }

  private applyStatusDistribution(transactions: TransactionData[]): void {
    const dist = this.config.statusDistribution
    const statuses: ('succeeded' | 'failed' | 'pending' | 'canceled')[] = []

    // Build status array based on distribution
    const total = dist.succeeded + dist.failed + dist.pending + dist.canceled
    const succeededCount = Math.floor(transactions.length * dist.succeeded / total)
    const failedCount = Math.floor(transactions.length * dist.failed / total)
    const pendingCount = Math.floor(transactions.length * dist.pending / total)
    const canceledCount = Math.floor(transactions.length * dist.canceled / total)

    statuses.push(...Array(succeededCount).fill('succeeded'))
    statuses.push(...Array(failedCount).fill('failed'))
    statuses.push(...Array(pendingCount).fill('pending'))
    statuses.push(...Array(canceledCount).fill('canceled'))

    // Fill remaining slots with 'succeeded' (due to rounding)
    while (statuses.length < transactions.length) {
      statuses.push('succeeded')
    }

    // Shuffle and apply
    this.shuffle(statuses)
    transactions.forEach((t, i) => {
      t.status = statuses[i]
    })
  }

  private applyDateRange(transactions: TransactionData[]): void {
    const start = Math.floor(this.config.dateRange.start.getTime() / 1000)
    const end = Math.floor(this.config.dateRange.end.getTime() / 1000)
    const range = end - start

    transactions.forEach(t => {
      t.created = start + Math.floor(Math.random() * range)
    })
  }

  private getProcessorPrefix(processor: ProcessorType): string {
    switch (processor) {
      case 'stripe': return 'ch'
      case 'paypal': return 'pp'
      case 'adyen': return 'ady'
    }
  }

  private getCurrency(processor: ProcessorType): string {
    switch (processor) {
      case 'stripe': return 'usd'
      case 'paypal': return 'usd'
      case 'adyen': return 'eur'
    }
  }

  private randomId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private randomIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
  }

  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
  }
}
