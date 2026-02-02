import { TransactionData } from '@/types'

interface PayPalFilters {
  status?: string
  created?: {
    gte?: number
    lte?: number
  }
  amount?: {
    gte?: number
    lte?: number
  }
  customer?: string
  country?: string
  currency?: string
  limit?: number
}

class PayPalMockClient {
  async listTransactions(filters: PayPalFilters = {}) {
    return this.generateMockTransactions(filters)
  }

  private generateMockTransactions(filters: PayPalFilters): TransactionData[] {
    const now = Math.floor(Date.now() / 1000)
    
    // Generate 100 diverse transactions with fraud patterns
    const mockData: TransactionData[] = [
      // Fraud Pattern 1: Rapid succession of small transactions (Card Testing)
      ...this.generateCardTestingPattern(now),
      
      // Fraud Pattern 2: Unusual high-value international transactions
      ...this.generateHighValueInternationalPattern(now),
      
      // Fraud Pattern 3: Round number amounts (often automated/fraudulent)
      ...this.generateRoundNumberPattern(now),
      
      // Fraud Pattern 4: Late-night transactions from suspicious locations
      ...this.generateNightTimePattern(now),
      
      // Fraud Pattern 5: Failed transactions followed by successful ones (retry attacks)
      ...this.generateRetryAttackPattern(now),
      
      // Normal legitimate transactions mixed in
      ...this.generateLegitimateTransactions(now),
      
      // Fraud Pattern 6: Multiple transactions to same merchant in short time
      ...this.generateVelocityFraudPattern(now),
      
      // Fraud Pattern 7: Transactions from high-risk countries
      ...this.generateHighRiskCountryPattern(now),
      
      // Fraud Pattern 8: Cryptocurrency-related suspicious transactions
      ...this.generateCryptoFraudPattern(now)
    ]

    // Apply filters
    let filteredData = mockData

    if (filters.status) {
      filteredData = filteredData.filter(t => t.status === filters.status)
    }

    if (filters.created) {
      if (filters.created.gte) {
        filteredData = filteredData.filter(t => t.created >= filters.created!.gte!)
      }
      if (filters.created.lte) {
        filteredData = filteredData.filter(t => t.created <= filters.created!.lte!)
      }
    }

    if (filters.amount) {
      if (filters.amount.gte) {
        filteredData = filteredData.filter(t => t.amount >= filters.amount!.gte!)
      }
      if (filters.amount.lte) {
        filteredData = filteredData.filter(t => t.amount <= filters.amount!.lte!)
      }
    }

    if (filters.currency) {
      filteredData = filteredData.filter(t => t.currency === filters.currency)
    }

    if (filters.country) {
      filteredData = filteredData.filter(t => t.metadata?.country === filters.country)
    }

    if (filters.limit) {
      filteredData = filteredData.slice(0, filters.limit)
    }

    return filteredData.sort((a, b) => b.created - a.created) // Most recent first
  }

  private generateCardTestingPattern(now: number): TransactionData[] {
    // 15 small transactions in rapid succession - classic card testing
    const baseTime = now - 3600 // 1 hour ago
    return Array.from({ length: 15 }, (_, i) => ({
      id: `pp_cardtest_${i.toString().padStart(3, '0')}`,
      amount: Math.floor(Math.random() * 200) + 100, // $1-$3
      currency: 'usd',
      status: (i < 12 ? 'failed' : 'succeeded') as TransactionData['status'],
      processor: 'paypal' as const,
      created: baseTime + (i * 30), // 30 seconds apart
      customer: 'cus_suspicious_001',
      description: 'Online purchase validation',
      payment_method: 'card_test',
      metadata: {
        country: 'US',
        ip_address: '192.168.1.100',
        risk_score: '95',
        fraud_indicators: 'rapid_succession,small_amounts,card_testing'
      }
    }))
  }

  private generateHighValueInternationalPattern(now: number): TransactionData[] {
    return [
      {
        id: 'pp_intl_001',
        amount: 850000, // $8,500
        currency: 'eur',
        status: 'succeeded' as const,
        processor: 'paypal' as const,
        created: now - 7200, // 2 hours ago
        customer: 'cus_intl_001',
        description: 'High-value international transfer',
        payment_method: 'bank_transfer',
        metadata: {
          country: 'RO', // Romania
          ip_address: '185.220.100.240',
          risk_score: '78',
          fraud_indicators: 'high_value,international,new_customer'
        }
      },
      {
        id: 'pp_intl_002',
        amount: 1200000, // $12,000
        currency: 'gbp',
        status: 'pending' as const,
        processor: 'paypal' as const,
        created: now - 5400, // 1.5 hours ago
        customer: undefined,
        description: 'Luxury goods purchase',
        payment_method: 'card_premium',
        metadata: {
          country: 'NG', // Nigeria
          ip_address: '197.210.70.134',
          risk_score: '89',
          fraud_indicators: 'high_value,high_risk_country,no_customer_history'
        }
      },
      {
        id: 'pp_intl_003',
        amount: 750000, // $7,500
        currency: 'cad',
        status: 'failed' as const,
        processor: 'paypal' as const,
        created: now - 1800, // 30 minutes ago
        customer: 'cus_intl_002',
        description: 'Electronics purchase',
        payment_method: 'card_declined',
        metadata: {
          country: 'CN',
          ip_address: '111.230.188.95',
          risk_score: '82',
          fraud_indicators: 'high_value,vpn_detected,multiple_declines'
        }
      }
    ]
  }

  private generateRoundNumberPattern(now: number): TransactionData[] {
    // Transactions with suspiciously round numbers
    const roundAmounts = [500000, 1000000, 250000, 750000, 2000000] // $5k, $10k, $2.5k, $7.5k, $20k
    return roundAmounts.map((amount, i) => ({
      id: `pp_round_${i.toString().padStart(3, '0')}`,
      amount,
      currency: 'usd',
      status: (i % 3 === 0 ? 'failed' : 'succeeded') as TransactionData['status'],
      processor: 'paypal' as const,
      created: now - (3600 * (i + 1)), // Spaced over hours
      customer: `cus_round_${i}`,
      description: 'Business transaction',
      payment_method: 'card_business',
      metadata: {
        country: 'US',
        ip_address: `10.0.${i}.100`,
        risk_score: '65',
        fraud_indicators: 'round_amount,automated_pattern'
      }
    }))
  }

  private generateNightTimePattern(now: number): TransactionData[] {
    // Transactions at 3 AM from various suspicious locations
    const nightTime = now - (now % 86400) + (3 * 3600) // 3 AM today
    return [
      {
        id: 'pp_night_001',
        amount: 45000, // $450
        currency: 'usd',
        status: 'succeeded' as const,
        processor: 'paypal' as const,
        created: nightTime,
        customer: 'cus_night_001',
        description: 'Late night purchase',
        payment_method: 'card_stolen',
        metadata: {
          country: 'RU',
          ip_address: '185.220.100.241',
          risk_score: '92',
          fraud_indicators: 'off_hours,high_risk_country,stolen_card_pattern',
          transaction_hour: '03'
        }
      },
      {
        id: 'pp_night_002',
        amount: 12500, // $125
        currency: 'usd',
        status: 'succeeded' as const,
        processor: 'paypal' as const,
        created: nightTime + 300, // 5 minutes later
        customer: 'cus_night_002',
        description: 'Gaming purchase',
        payment_method: 'card_gaming',
        metadata: {
          country: 'PK',
          ip_address: '103.255.4.125',
          risk_score: '88',
          fraud_indicators: 'off_hours,high_risk_country,gaming_fraud',
          transaction_hour: '03'
        }
      }
    ]
  }

  private generateRetryAttackPattern(now: number): TransactionData[] {
    // Multiple failed attempts followed by successful transaction
    const baseTime = now - 1800 // 30 minutes ago
    const retryTransactions = []
    
    // 8 failed attempts
    for (let i = 0; i < 8; i++) {
      retryTransactions.push({
        id: `pp_retry_fail_${i.toString().padStart(3, '0')}`,
        amount: 25000, // $250
        currency: 'usd',
        status: 'failed' as const,
        processor: 'paypal' as const,
        created: baseTime + (i * 60), // 1 minute apart
        customer: 'cus_retry_001',
        description: 'Subscription renewal',
        payment_method: `card_attempt_${i + 1}`,
        metadata: {
          country: 'US',
          ip_address: '203.0.113.195',
          risk_score: '85',
          fraud_indicators: 'multiple_retries,card_testing,velocity_fraud',
          attempt_number: (i + 1).toString()
        }
      })
    }

    // Finally successful
    retryTransactions.push({
      id: 'pp_retry_success_001',
      amount: 25000,
      currency: 'usd',
      status: 'succeeded' as const,
      processor: 'paypal' as const,
      created: baseTime + (8 * 60),
      customer: 'cus_retry_001',
      description: 'Subscription renewal',
      payment_method: 'card_success',
      metadata: {
        country: 'US',
        ip_address: '203.0.113.195',
        risk_score: '75',
        fraud_indicators: 'successful_after_retries,potential_card_cracking',
        attempt_number: '9'
      }
    })
    
    return retryTransactions
  }

  private generateLegitimateTransactions(now: number): TransactionData[] {
    // Normal, legitimate-looking transactions
    const legitimate = []
    const normalAmounts = [1299, 4599, 789, 2150, 3500, 899, 1650, 5200] // Realistic amounts
    const currencies = ['usd', 'eur', 'cad', 'aud']
    const countries = ['US', 'CA', 'GB', 'AU', 'DE', 'FR']
    
    for (let i = 0; i < 25; i++) {
      legitimate.push({
        id: `pp_legit_${i.toString().padStart(3, '0')}`,
        amount: normalAmounts[i % normalAmounts.length] * 100,
        currency: currencies[i % currencies.length],
        status: (Math.random() > 0.1 ? 'succeeded' : 'failed') as TransactionData['status'], // 90% success rate
        processor: 'paypal' as const,
        created: now - (Math.random() * 86400 * 7), // Random within last week
        customer: `cus_legit_${i}`,
        description: ['Online purchase', 'Subscription', 'Digital download', 'Service fee'][i % 4],
        payment_method: 'card_verified',
        metadata: {
          country: countries[i % countries.length],
          ip_address: `192.168.${Math.floor(i / 10)}.${i % 255}`,
          risk_score: (Math.random() * 30 + 10).toString(), // Low risk 10-40
          fraud_indicators: 'none'
        }
      })
    }
    
    return legitimate
  }

  private generateVelocityFraudPattern(now: number): TransactionData[] {
    // 12 transactions to same merchant in 10 minutes - velocity fraud
    const baseTime = now - 1200 // 20 minutes ago
    return Array.from({ length: 12 }, (_, i) => ({
      id: `pp_velocity_${i.toString().padStart(3, '0')}`,
      amount: Math.floor(Math.random() * 5000) + 1000, // $10-$60
      currency: 'usd',
      status: (i < 2 ? 'failed' : 'succeeded') as TransactionData['status'],
      processor: 'paypal' as const,
      created: baseTime + (i * 50), // 50 seconds apart
      customer: 'cus_velocity_001',
      description: 'Digital goods purchase',
      payment_method: 'card_velocity',
      metadata: {
        country: 'US',
        merchant_id: 'merchant_gaming_001',
        ip_address: '198.51.100.42',
        risk_score: '90',
        fraud_indicators: 'velocity_fraud,same_merchant,rapid_succession',
        merchant_category: 'gaming'
      }
    }))
  }

  private generateHighRiskCountryPattern(now: number): TransactionData[] {
    // Transactions from countries known for fraud
    const highRiskCountries = ['NG', 'GH', 'ID', 'PK', 'BD']
    const riskCountryNames = ['Nigeria', 'Ghana', 'Indonesia', 'Pakistan', 'Bangladesh']

    return highRiskCountries.map((country, i) => ({
      id: `pp_highrisk_${i.toString().padStart(3, '0')}`,
      amount: Math.floor(Math.random() * 100000) + 50000, // $500-$1500
      currency: 'usd',
      status: (Math.random() > 0.3 ? 'succeeded' : 'failed') as TransactionData['status'], // 70% success
      processor: 'paypal' as const,
      created: now - (3600 * (i + 1)), // Spaced over hours
      customer: `cus_highrisk_${i}`,
      description: 'International purchase',
      payment_method: 'card_international',
      metadata: {
        country,
        country_name: riskCountryNames[i],
        ip_address: `203.0.113.${100 + i}`,
        risk_score: (85 + Math.random() * 10).toString(),
        fraud_indicators: 'high_risk_country,international_card,new_customer'
      }
    }))
  }

  private generateCryptoFraudPattern(now: number): TransactionData[] {
    // Cryptocurrency-related suspicious transactions
    return [
      {
        id: 'pp_crypto_001',
        amount: 500000, // $5,000
        currency: 'usd',
        status: 'succeeded' as const,
        processor: 'paypal' as const,
        created: now - 900, // 15 minutes ago
        customer: 'cus_crypto_001',
        description: 'Bitcoin exchange deposit',
        payment_method: 'card_crypto',
        metadata: {
          country: 'US',
          merchant_category: 'cryptocurrency',
          ip_address: '172.16.254.1',
          risk_score: '88',
          fraud_indicators: 'crypto_exchange,high_risk_merchant,money_laundering_risk'
        }
      },
      {
        id: 'pp_crypto_002',
        amount: 1000000, // $10,000
        currency: 'usd',
        status: 'pending' as const,
        processor: 'paypal' as const,
        created: now - 600, // 10 minutes ago
        customer: undefined,
        description: 'Cryptocurrency purchase',
        payment_method: 'card_anonymous',
        metadata: {
          country: 'VPN',
          merchant_category: 'cryptocurrency',
          ip_address: '10.0.0.1',
          risk_score: '95',
          fraud_indicators: 'crypto_exchange,vpn_detected,no_customer_verification,high_value'
        }
      }
    ]
  }
}

export default PayPalMockClient