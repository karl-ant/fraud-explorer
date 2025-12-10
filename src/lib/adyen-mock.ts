import { TransactionData } from '@/types'

interface AdyenFilters {
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

class AdyenMockClient {
  async listTransactions(filters: AdyenFilters = {}) {
    return this.generateMockTransactions(filters)
  }

  private generateMockTransactions(filters: AdyenFilters): TransactionData[] {
    const now = Math.floor(Date.now() / 1000)

    // Generate diverse transactions with Adyen-specific fraud patterns
    const mockData: TransactionData[] = [
      // Fraud Pattern 1: Card testing with Adyen characteristics
      ...this.generateCardTestingPattern(now),

      // Fraud Pattern 2: 3DS authentication failures (card processor specific)
      ...this.generate3DSFailurePattern(now),

      // Fraud Pattern 3: EU cross-border high-value (Adyen is EU-based)
      ...this.generateEUCrossBorderPattern(now),

      // Fraud Pattern 4: Account takeover attempts
      ...this.generateAccountTakeoverPattern(now),

      // Fraud Pattern 5: Velocity fraud
      ...this.generateVelocityFraudPattern(now),

      // Normal legitimate transactions
      ...this.generateLegitimateTransactions(now),

      // Fraud Pattern 6: High-risk countries
      ...this.generateHighRiskCountryPattern(now),

      // Fraud Pattern 7: Round number fraud
      ...this.generateRoundNumberPattern(now),
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

    return filteredData.sort((a, b) => b.created - a.created)
  }

  private generateCardTestingPattern(now: number): TransactionData[] {
    // 12 small transactions - card testing with Adyen IDs
    const baseTime = now - 2700 // 45 minutes ago
    return Array.from({ length: 12 }, (_, i) => ({
      id: `8816${Date.now().toString().slice(-8)}${i.toString().padStart(3, '0')}`,
      amount: Math.floor(Math.random() * 300) + 50, // $0.50-$3.50
      currency: 'eur',
      status: (i < 10 ? 'failed' : 'succeeded') as 'failed' | 'succeeded',
      processor: 'adyen' as const,
      created: baseTime + (i * 25), // 25 seconds apart
      customer: 'cus_adyen_test_001',
      description: 'Card validation',
      payment_method: 'scheme',
      metadata: {
        country: 'NL',
        ip_address: '195.135.221.12',
        risk_score: '93',
        fraud_indicators: 'card_testing,rapid_succession,small_amounts',
        psp_reference: `ady_${i}`,
        card_bin: '424242'
      }
    }))
  }

  private generate3DSFailurePattern(now: number): TransactionData[] {
    // 3D Secure authentication failures - Adyen specific
    const baseTime = now - 4200 // 70 minutes ago
    return [
      {
        id: `psp_${Date.now().toString().slice(-12)}001`,
        amount: 18900, // $189
        currency: 'gbp',
        status: 'failed' as const,
        processor: 'adyen' as const,
        created: baseTime,
        customer: 'cus_3ds_001',
        description: 'Online purchase - 3DS failed',
        payment_method: 'scheme',
        metadata: {
          country: 'GB',
          ip_address: '81.107.84.123',
          risk_score: '85',
          fraud_indicators: '3ds_failed,authentication_declined',
          challenge_indicator: 'challenge_requested',
          authentication_result: 'failed',
          eci: '00'
        }
      },
      {
        id: `psp_${Date.now().toString().slice(-12)}002`,
        amount: 45000, // $450
        currency: 'eur',
        status: 'failed' as const,
        processor: 'adyen' as const,
        created: baseTime + 180,
        customer: 'cus_3ds_002',
        description: 'Electronics purchase - Auth failed',
        payment_method: 'scheme',
        metadata: {
          country: 'FR',
          ip_address: '80.12.97.45',
          risk_score: '88',
          fraud_indicators: '3ds_failed,cardholder_not_enrolled',
          challenge_indicator: 'no_challenge',
          authentication_result: 'not_enrolled',
          eci: '00'
        }
      },
      {
        id: `psp_${Date.now().toString().slice(-12)}003`,
        amount: 120000, // $1,200
        currency: 'eur',
        status: 'failed' as const,
        processor: 'adyen' as const,
        created: baseTime + 360,
        customer: 'cus_3ds_003',
        description: 'High-value purchase - 3DS timeout',
        payment_method: 'scheme',
        metadata: {
          country: 'IT',
          ip_address: '93.35.174.89',
          risk_score: '90',
          fraud_indicators: '3ds_timeout,high_value,authentication_abandoned',
          challenge_indicator: 'challenge_requested',
          authentication_result: 'timeout',
          eci: '00'
        }
      }
    ]
  }

  private generateEUCrossBorderPattern(now: number): TransactionData[] {
    // High-value EU cross-border transactions
    return [
      {
        id: `ady_${Date.now().toString().slice(-13)}001`,
        amount: 580000, // $5,800
        currency: 'eur',
        status: 'succeeded' as const,
        processor: 'adyen' as const,
        created: now - 5400, // 1.5 hours ago
        customer: 'cus_eu_merchant_001',
        description: 'Cross-border B2B payment',
        payment_method: 'sepadirectdebit',
        metadata: {
          country: 'DE',
          destination_country: 'PL',
          ip_address: '217.160.0.187',
          risk_score: '72',
          fraud_indicators: 'cross_border,high_value,b2b_transaction',
          merchant_category: 'wholesale'
        }
      },
      {
        id: `ady_${Date.now().toString().slice(-13)}002`,
        amount: 950000, // $9,500
        currency: 'eur',
        status: 'pending' as const,
        processor: 'adyen' as const,
        created: now - 3600, // 1 hour ago
        customer: 'cus_eu_merchant_002',
        description: 'International wire transfer',
        payment_method: 'bankTransfer_IBAN',
        metadata: {
          country: 'NL',
          destination_country: 'RO',
          ip_address: '185.3.93.47',
          risk_score: '81',
          fraud_indicators: 'cross_border,high_value,eastern_europe',
          merchant_category: 'services'
        }
      },
      {
        id: `ady_${Date.now().toString().slice(-13)}003`,
        amount: 1200000, // $12,000
        currency: 'chf',
        status: 'succeeded' as const,
        processor: 'adyen' as const,
        created: now - 7200, // 2 hours ago
        customer: 'cus_eu_swiss_001',
        description: 'Luxury goods purchase',
        payment_method: 'scheme',
        metadata: {
          country: 'CH',
          destination_country: 'MC',
          ip_address: '178.209.52.149',
          risk_score: '68',
          fraud_indicators: 'high_value,luxury_goods,switzerland',
          merchant_category: 'luxury_retail'
        }
      }
    ]
  }

  private generateAccountTakeoverPattern(now: number): TransactionData[] {
    // Account takeover attempts with rapid credential testing
    const baseTime = now - 1800 // 30 minutes ago
    const ato = []

    // 6 failed login attempts with purchases
    for (let i = 0; i < 6; i++) {
      ato.push({
        id: `8816${Date.now().toString().slice(-8)}ato${i.toString().padStart(3, '0')}`,
        amount: 15000 + (i * 1000), // Increasing amounts
        currency: 'usd',
        status: 'failed' as const,
        processor: 'adyen' as const,
        created: baseTime + (i * 120), // 2 minutes apart
        customer: `cus_ato_target`,
        description: 'Account purchase attempt',
        payment_method: 'scheme',
        metadata: {
          country: 'US',
          ip_address: `45.142.${i}.${100 + i}`, // Different IPs
          risk_score: (85 + i * 2).toString(),
          fraud_indicators: 'account_takeover,credential_stuffing,ip_velocity',
          login_attempts: (i + 1).toString(),
          device_fingerprint_mismatch: 'true'
        }
      })
    }

    // Successful takeover
    ato.push({
      id: `8816${Date.now().toString().slice(-8)}ato_success`,
      amount: 89900, // $899
      currency: 'usd',
      status: 'succeeded' as const,
      processor: 'adyen' as const,
      created: baseTime + (6 * 120),
      customer: 'cus_ato_target',
      description: 'Digital goods purchase',
      payment_method: 'paypal',
      metadata: {
        country: 'US',
        ip_address: '45.142.6.106',
        risk_score: '94',
        fraud_indicators: 'account_takeover,successful_after_failures,payment_method_changed',
        login_attempts: '7',
        device_fingerprint_mismatch: 'true',
        payment_method_added_recently: 'true'
      }
    })

    return ato
  }

  private generateVelocityFraudPattern(now: number): TransactionData[] {
    // Multiple transactions in rapid succession - velocity abuse
    const baseTime = now - 900 // 15 minutes ago
    return Array.from({ length: 10 }, (_, i) => ({
      id: `psp_velocity_${Date.now().toString().slice(-9)}${i}`,
      amount: Math.floor(Math.random() * 8000) + 2000, // $20-$100
      currency: 'eur',
      status: (i < 1 ? 'failed' : 'succeeded') as 'failed' | 'succeeded',
      processor: 'adyen' as const,
      created: baseTime + (i * 60), // 1 minute apart
      customer: 'cus_velocity_adyen_001',
      description: 'Gaming credits purchase',
      payment_method: 'scheme',
      metadata: {
        country: 'NL',
        merchant_id: 'adyen_gaming_merchant_001',
        ip_address: '185.107.56.123',
        risk_score: '87',
        fraud_indicators: 'velocity_fraud,gaming_merchant,rapid_succession',
        merchant_category: 'gaming',
        same_card_bin: '515599'
      }
    }))
  }

  private generateLegitimateTransactions(now: number): TransactionData[] {
    // Normal, legitimate Adyen transactions
    const legitimate = []
    const normalAmounts = [2499, 5999, 1299, 8750, 4200, 3150, 6800, 2900]
    const currencies = ['eur', 'gbp', 'usd', 'chf']
    const countries = ['NL', 'GB', 'DE', 'FR', 'BE', 'AT', 'CH', 'SE']
    const methods = ['scheme', 'ideal', 'sepadirectdebit', 'paypal', 'giropay']

    for (let i = 0; i < 30; i++) {
      legitimate.push({
        id: `ady_legit_${Date.now().toString().slice(-10)}${i.toString().padStart(3, '0')}`,
        amount: normalAmounts[i % normalAmounts.length] * 100,
        currency: currencies[i % currencies.length],
        status: (Math.random() > 0.05 ? 'succeeded' : 'failed') as 'succeeded' | 'failed',
        processor: 'adyen' as const,
        created: now - (Math.random() * 86400 * 7), // Random within last week
        customer: `cus_adyen_legit_${i}`,
        description: ['E-commerce purchase', 'Subscription payment', 'Digital service', 'Software license'][i % 4],
        payment_method: methods[i % methods.length],
        metadata: {
          country: countries[i % countries.length],
          ip_address: `192.168.${Math.floor(i / 10)}.${i % 255}`,
          risk_score: (Math.random() * 25 + 15).toString(), // Low risk 15-40
          fraud_indicators: 'none',
          eci: '05',
          authentication_result: '3ds_authenticated'
        }
      })
    }

    return legitimate
  }

  private generateHighRiskCountryPattern(now: number): TransactionData[] {
    // Transactions from high-risk countries for Adyen
    const highRiskCountries = ['NG', 'ID', 'VN', 'PH', 'IN']
    const riskCountryNames = ['Nigeria', 'Indonesia', 'Vietnam', 'Philippines', 'India']

    return highRiskCountries.map((country, i) => ({
      id: `8816${Date.now().toString().slice(-8)}risk${i}`,
      amount: Math.floor(Math.random() * 150000) + 50000, // $500-$2000
      currency: 'usd',
      status: (Math.random() > 0.4 ? 'succeeded' : 'failed') as 'succeeded' | 'failed',
      processor: 'adyen' as const,
      created: now - (7200 * (i + 1)), // Spaced over hours
      customer: `cus_adyen_highrisk_${i}`,
      description: 'International e-commerce',
      payment_method: 'scheme',
      metadata: {
        country,
        country_name: riskCountryNames[i],
        ip_address: `103.${50 + i * 10}.${100 + i}.${10 + i}`,
        risk_score: (80 + Math.random() * 15).toString(),
        fraud_indicators: 'high_risk_country,international_card,new_customer',
        card_country: 'US', // Card from different country
        card_country_mismatch: 'true'
      }
    }))
  }

  private generateRoundNumberPattern(now: number): TransactionData[] {
    // Suspiciously round number amounts
    const roundAmounts = [100000, 250000, 500000, 1000000, 2500000] // $1k, $2.5k, $5k, $10k, $25k
    return roundAmounts.map((amount, i) => ({
      id: `psp_round_${Date.now().toString().slice(-10)}${i}`,
      amount,
      currency: 'eur',
      status: (i % 2 === 0 ? 'succeeded' : 'failed') as 'succeeded' | 'failed',
      processor: 'adyen' as const,
      created: now - (7200 * (i + 1)), // Spaced over hours
      customer: `cus_adyen_round_${i}`,
      description: 'Business transaction',
      payment_method: 'bankTransfer_IBAN',
      metadata: {
        country: 'NL',
        ip_address: `10.${i}.0.1`,
        risk_score: '70',
        fraud_indicators: 'round_amount,automated_pattern,business_transaction',
        merchant_category: 'wholesale'
      }
    }))
  }
}

export default AdyenMockClient
