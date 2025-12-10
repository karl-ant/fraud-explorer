import { TransactionData } from '@/types'

export interface GeneratorConfig {
  count: number
  processor: 'stripe' | 'paypal' | 'adyen'
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
    this.config = config
  }

  generate(): TransactionData[] {
    const transactions: TransactionData[] = []

    // Calculate how many transactions for each pattern
    const total = this.config.count
    const fraudCount = Math.floor(total * (100 - this.config.fraudMix.legitimate) / 100)
    const legitimateCount = total - fraudCount

    // Generate fraud patterns based on percentages
    const fraudTypes = [
      { type: 'cardTesting', pct: this.config.fraudMix.cardTesting, generator: this.generateCardTesting.bind(this) },
      { type: 'velocityFraud', pct: this.config.fraudMix.velocityFraud, generator: this.generateVelocityFraud.bind(this) },
      { type: 'highRiskCountry', pct: this.config.fraudMix.highRiskCountry, generator: this.generateHighRiskCountry.bind(this) },
      { type: 'roundNumber', pct: this.config.fraudMix.roundNumber, generator: this.generateRoundNumber.bind(this) },
      { type: 'retryAttack', pct: this.config.fraudMix.retryAttack, generator: this.generateRetryAttack.bind(this) },
      { type: 'cryptoFraud', pct: this.config.fraudMix.cryptoFraud, generator: this.generateCryptoFraud.bind(this) },
      { type: 'nightTime', pct: this.config.fraudMix.nightTime, generator: this.generateNightTime.bind(this) },
      { type: 'highValue', pct: this.config.fraudMix.highValue, generator: this.generateHighValue.bind(this) },
    ]

    // Calculate total fraud percentage
    const totalFraudPct = fraudTypes.reduce((sum, ft) => sum + ft.pct, 0)

    // Generate fraud transactions
    fraudTypes.forEach(fraudType => {
      if (totalFraudPct > 0) {
        const count = Math.floor(fraudCount * (fraudType.pct / totalFraudPct))
        if (count > 0) {
          transactions.push(...fraudType.generator(count))
        }
      }
    })

    // Generate legitimate transactions
    if (legitimateCount > 0) {
      transactions.push(...this.generateLegitimate(legitimateCount))
    }

    // Apply status distribution
    this.applyStatusDistribution(transactions)

    // Apply date range
    this.applyDateRange(transactions)

    return transactions
  }

  private generateCardTesting(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_ct_${this.randomId()}`,
        amount: Math.floor(Math.random() * 300) + 50, // $0.50-$3.50
        currency: this.getCurrency(),
        status: 'failed',
        processor: this.config.processor,
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

  private generateVelocityFraud(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_vel_${this.randomId()}`,
        amount: Math.floor(Math.random() * 5000) + 1000, // $10-$60
        currency: this.getCurrency(),
        status: 'succeeded',
        processor: this.config.processor,
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

  private generateHighRiskCountry(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const countries = ['NG', 'GH', 'ID', 'PK', 'BD', 'VN']

    for (let i = 0; i < count; i++) {
      const country = countries[i % countries.length]
      transactions.push({
        id: `${this.getProcessorPrefix()}_hrisk_${this.randomId()}`,
        amount: Math.floor(Math.random() * 100000) + 50000, // $500-$1500
        currency: 'usd',
        status: 'succeeded',
        processor: this.config.processor,
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

  private generateRoundNumber(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const roundAmounts = [500000, 1000000, 250000, 750000, 2000000]

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_round_${this.randomId()}`,
        amount: roundAmounts[i % roundAmounts.length],
        currency: this.getCurrency(),
        status: 'succeeded',
        processor: this.config.processor,
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

  private generateRetryAttack(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_retry_${this.randomId()}`,
        amount: 25000, // $250
        currency: this.getCurrency(),
        status: (i % 3 === 0 ? 'succeeded' : 'failed') as 'succeeded' | 'failed',
        processor: this.config.processor,
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

  private generateCryptoFraud(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_crypto_${this.randomId()}`,
        amount: Math.floor(Math.random() * 500000) + 300000, // $3k-$8k
        currency: 'usd',
        status: 'succeeded',
        processor: this.config.processor,
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

  private generateNightTime(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const nightTime = now - (now % 86400) + (3 * 3600) // 3 AM

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_night_${this.randomId()}`,
        amount: Math.floor(Math.random() * 40000) + 10000, // $100-$500
        currency: this.getCurrency(),
        status: 'succeeded',
        processor: this.config.processor,
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

  private generateHighValue(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_hval_${this.randomId()}`,
        amount: Math.floor(Math.random() * 1000000) + 500000, // $5k-$15k
        currency: this.getCurrency(),
        status: 'succeeded',
        processor: this.config.processor,
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

  private generateLegitimate(count: number): TransactionData[] {
    const transactions: TransactionData[] = []
    const now = Math.floor(Date.now() / 1000)
    const normalAmounts = [1299, 4599, 789, 2150, 3500, 899, 1650, 5200]

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `${this.getProcessorPrefix()}_legit_${this.randomId()}`,
        amount: normalAmounts[i % normalAmounts.length] * 100,
        currency: this.getCurrency(),
        status: 'succeeded',
        processor: this.config.processor,
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
    statuses.push(...Array(Math.floor(transactions.length * dist.succeeded / total)).fill('succeeded'))
    statuses.push(...Array(Math.floor(transactions.length * dist.failed / total)).fill('failed'))
    statuses.push(...Array(Math.floor(transactions.length * dist.pending / total)).fill('pending'))
    statuses.push(...Array(Math.floor(transactions.length * dist.canceled / total)).fill('canceled'))

    // Shuffle and apply
    this.shuffle(statuses)
    transactions.forEach((t, i) => {
      if (i < statuses.length) {
        t.status = statuses[i]
      }
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

  private getProcessorPrefix(): string {
    switch (this.config.processor) {
      case 'stripe': return 'ch'
      case 'paypal': return 'pp'
      case 'adyen': return 'ady'
    }
  }

  private getCurrency(): string {
    switch (this.config.processor) {
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
