import PayPalMockClient from './paypal-mock'

describe('PayPalMockClient', () => {
  let client: PayPalMockClient

  beforeEach(() => {
    client = new PayPalMockClient()
  })

  describe('listTransactions', () => {
    it('should return an array of transactions', async () => {
      const transactions = await client.listTransactions()

      expect(Array.isArray(transactions)).toBe(true)
      expect(transactions.length).toBeGreaterThan(0)
    })

    it('should return transactions with correct structure', async () => {
      const transactions = await client.listTransactions()

      transactions.forEach(tx => {
        expect(tx).toHaveProperty('id')
        expect(tx).toHaveProperty('amount')
        expect(tx).toHaveProperty('currency')
        expect(tx).toHaveProperty('status')
        expect(tx).toHaveProperty('processor')
        expect(tx).toHaveProperty('created')
        expect(tx.processor).toBe('paypal')
      })
    })

    it('should return transactions sorted by created timestamp (most recent first)', async () => {
      const transactions = await client.listTransactions()

      for (let i = 0; i < transactions.length - 1; i++) {
        expect(transactions[i].created).toBeGreaterThanOrEqual(transactions[i + 1].created)
      }
    })
  })

  describe('filtering', () => {
    describe('status filter', () => {
      it('should filter by succeeded status', async () => {
        const transactions = await client.listTransactions({ status: 'succeeded' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.status).toBe('succeeded')
        })
      })

      it('should filter by failed status', async () => {
        const transactions = await client.listTransactions({ status: 'failed' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.status).toBe('failed')
        })
      })

      it('should filter by pending status', async () => {
        const transactions = await client.listTransactions({ status: 'pending' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.status).toBe('pending')
        })
      })
    })

    describe('created timestamp filter', () => {
      it('should filter by created.gte (greater than or equal)', async () => {
        const now = Math.floor(Date.now() / 1000)
        const oneHourAgo = now - 3600

        const transactions = await client.listTransactions({
          created: { gte: oneHourAgo }
        })

        transactions.forEach(tx => {
          expect(tx.created).toBeGreaterThanOrEqual(oneHourAgo)
        })
      })

      it('should filter by created.lte (less than or equal)', async () => {
        const now = Math.floor(Date.now() / 1000)
        const twoHoursAgo = now - 7200

        const transactions = await client.listTransactions({
          created: { lte: twoHoursAgo }
        })

        transactions.forEach(tx => {
          expect(tx.created).toBeLessThanOrEqual(twoHoursAgo)
        })
      })

      it('should filter by date range (gte and lte)', async () => {
        const now = Math.floor(Date.now() / 1000)
        const oneHourAgo = now - 3600
        const twoHoursAgo = now - 7200

        const transactions = await client.listTransactions({
          created: { gte: twoHoursAgo, lte: oneHourAgo }
        })

        transactions.forEach(tx => {
          expect(tx.created).toBeGreaterThanOrEqual(twoHoursAgo)
          expect(tx.created).toBeLessThanOrEqual(oneHourAgo)
        })
      })
    })

    describe('amount filter', () => {
      it('should filter by amount.gte (greater than or equal)', async () => {
        const minAmount = 100000 // $1000 in cents

        const transactions = await client.listTransactions({
          amount: { gte: minAmount }
        })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.amount).toBeGreaterThanOrEqual(minAmount)
        })
      })

      it('should filter by amount.lte (less than or equal)', async () => {
        const maxAmount = 5000 // $50 in cents

        const transactions = await client.listTransactions({
          amount: { lte: maxAmount }
        })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.amount).toBeLessThanOrEqual(maxAmount)
        })
      })

      it('should filter by amount range (gte and lte)', async () => {
        const minAmount = 10000 // $100
        const maxAmount = 100000 // $1000

        const transactions = await client.listTransactions({
          amount: { gte: minAmount, lte: maxAmount }
        })

        transactions.forEach(tx => {
          expect(tx.amount).toBeGreaterThanOrEqual(minAmount)
          expect(tx.amount).toBeLessThanOrEqual(maxAmount)
        })
      })
    })

    describe('currency filter', () => {
      it('should filter by USD currency', async () => {
        const transactions = await client.listTransactions({ currency: 'usd' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.currency).toBe('usd')
        })
      })

      it('should filter by EUR currency', async () => {
        const transactions = await client.listTransactions({ currency: 'eur' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.currency).toBe('eur')
        })
      })

      it('should filter by CAD currency', async () => {
        const transactions = await client.listTransactions({ currency: 'cad' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.currency).toBe('cad')
        })
      })
    })

    describe('country filter', () => {
      it('should filter by country US', async () => {
        const transactions = await client.listTransactions({ country: 'US' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.metadata?.country).toBe('US')
        })
      })

      it('should filter by high-risk country NG (Nigeria)', async () => {
        const transactions = await client.listTransactions({ country: 'NG' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.metadata?.country).toBe('NG')
        })
      })
    })

    describe('limit filter', () => {
      it('should limit the number of transactions returned', async () => {
        const limit = 5
        const transactions = await client.listTransactions({ limit })

        expect(transactions.length).toBeLessThanOrEqual(limit)
      })

      it('should return all transactions when limit is greater than total', async () => {
        const allTransactions = await client.listTransactions()
        const limitedTransactions = await client.listTransactions({ limit: 1000 })

        expect(limitedTransactions.length).toBe(allTransactions.length)
      })
    })

    describe('combined filters', () => {
      it('should combine status and amount filters', async () => {
        const transactions = await client.listTransactions({
          status: 'failed',
          amount: { gte: 10000 }
        })

        transactions.forEach(tx => {
          expect(tx.status).toBe('failed')
          expect(tx.amount).toBeGreaterThanOrEqual(10000)
        })
      })

      it('should combine status, currency, and limit filters', async () => {
        const limit = 3
        const transactions = await client.listTransactions({
          status: 'succeeded',
          currency: 'usd',
          limit
        })

        expect(transactions.length).toBeLessThanOrEqual(limit)
        transactions.forEach(tx => {
          expect(tx.status).toBe('succeeded')
          expect(tx.currency).toBe('usd')
        })
      })
    })
  })

  describe('fraud patterns', () => {
    describe('card testing pattern', () => {
      it('should generate card testing transactions', async () => {
        const transactions = await client.listTransactions()

        const cardTestingTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('card_testing')
        )

        expect(cardTestingTxs.length).toBeGreaterThan(0)
      })

      it('should have small amounts for card testing', async () => {
        const transactions = await client.listTransactions()

        const cardTestingTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('card_testing') &&
          tx.id.startsWith('pp_cardtest')
        )

        cardTestingTxs.forEach(tx => {
          expect(tx.amount).toBeLessThan(500) // Less than $5
        })
      })

      it('should have rapid succession indicator for card testing', async () => {
        const transactions = await client.listTransactions()

        const cardTestingTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_cardtest')
        )

        cardTestingTxs.forEach(tx => {
          expect(tx.metadata?.fraud_indicators).toContain('rapid_succession')
        })
      })
    })

    describe('high-value international pattern', () => {
      it('should generate high-value international transactions', async () => {
        const transactions = await client.listTransactions()

        const intlTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_intl')
        )

        expect(intlTxs.length).toBeGreaterThan(0)
      })

      it('should have high values for international transactions', async () => {
        const transactions = await client.listTransactions()

        const intlTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_intl')
        )

        intlTxs.forEach(tx => {
          expect(tx.amount).toBeGreaterThan(500000) // Greater than $5000
        })
      })

      it('should include high-risk countries for international transactions', async () => {
        const transactions = await client.listTransactions()

        const intlTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_intl')
        )

        const countries = intlTxs.map(tx => tx.metadata?.country)
        const highRiskCountries = ['RO', 'NG', 'CN']

        expect(countries.some(c => highRiskCountries.includes(c))).toBe(true)
      })
    })

    describe('round number pattern', () => {
      it('should generate round number transactions', async () => {
        const transactions = await client.listTransactions()

        const roundTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('round_amount')
        )

        expect(roundTxs.length).toBeGreaterThan(0)
      })

      it('should have round amounts (divisible by 50000)', async () => {
        const transactions = await client.listTransactions()

        const roundTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_round')
        )

        roundTxs.forEach(tx => {
          expect(tx.amount % 50000).toBe(0)
        })
      })
    })

    describe('nighttime pattern', () => {
      it('should generate nighttime transactions', async () => {
        const transactions = await client.listTransactions()

        const nightTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('off_hours')
        )

        expect(nightTxs.length).toBeGreaterThan(0)
      })

      it('should have transaction_hour metadata for nighttime transactions', async () => {
        const transactions = await client.listTransactions()

        const nightTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_night')
        )

        nightTxs.forEach(tx => {
          expect(tx.metadata?.transaction_hour).toBe('03')
        })
      })

      it('should have high risk scores for nighttime transactions', async () => {
        const transactions = await client.listTransactions()

        const nightTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_night')
        )

        nightTxs.forEach(tx => {
          const riskScore = parseFloat(tx.metadata?.risk_score || '0')
          expect(riskScore).toBeGreaterThanOrEqual(85)
        })
      })
    })

    describe('retry attack pattern', () => {
      it('should generate retry attack transactions', async () => {
        const transactions = await client.listTransactions()

        const retryTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_retry')
        )

        expect(retryTxs.length).toBeGreaterThan(0)
      })

      it('should have mostly failed transactions followed by success', async () => {
        const transactions = await client.listTransactions()

        const retryTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_retry')
        )

        const failedRetries = retryTxs.filter(tx => tx.status === 'failed')
        const successRetries = retryTxs.filter(tx => tx.status === 'succeeded')

        expect(failedRetries.length).toBeGreaterThan(successRetries.length)
      })

      it('should have attempt_number metadata for retry transactions', async () => {
        const transactions = await client.listTransactions()

        const retryTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_retry')
        )

        retryTxs.forEach(tx => {
          expect(tx.metadata?.attempt_number).toBeDefined()
        })
      })
    })

    describe('velocity fraud pattern', () => {
      it('should generate velocity fraud transactions', async () => {
        const transactions = await client.listTransactions()

        const velocityTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('velocity_fraud')
        )

        expect(velocityTxs.length).toBeGreaterThan(0)
      })

      it('should have same_merchant indicator for velocity fraud', async () => {
        const transactions = await client.listTransactions()

        const velocityTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_velocity')
        )

        velocityTxs.forEach(tx => {
          expect(tx.metadata?.fraud_indicators).toContain('same_merchant')
        })
      })

      it('should have merchant_id metadata for velocity fraud', async () => {
        const transactions = await client.listTransactions()

        const velocityTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_velocity')
        )

        velocityTxs.forEach(tx => {
          expect(tx.metadata?.merchant_id).toBe('merchant_gaming_001')
        })
      })
    })

    describe('high-risk country pattern', () => {
      it('should generate high-risk country transactions', async () => {
        const transactions = await client.listTransactions()

        const highRiskTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('high_risk_country') &&
          tx.id.startsWith('pp_highrisk')
        )

        expect(highRiskTxs.length).toBeGreaterThan(0)
      })

      it('should include known high-risk countries', async () => {
        const transactions = await client.listTransactions()

        const highRiskTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_highrisk')
        )

        const highRiskCountries = ['NG', 'GH', 'ID', 'PK', 'BD']
        const countries = highRiskTxs.map(tx => tx.metadata?.country)

        expect(countries.every(c => highRiskCountries.includes(c))).toBe(true)
      })

      it('should have country_name metadata for high-risk country transactions', async () => {
        const transactions = await client.listTransactions()

        const highRiskTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_highrisk')
        )

        highRiskTxs.forEach(tx => {
          expect(tx.metadata?.country_name).toBeDefined()
        })
      })
    })

    describe('crypto fraud pattern', () => {
      it('should generate cryptocurrency-related transactions', async () => {
        const transactions = await client.listTransactions()

        const cryptoTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_crypto')
        )

        expect(cryptoTxs.length).toBeGreaterThan(0)
      })

      it('should have cryptocurrency merchant category', async () => {
        const transactions = await client.listTransactions()

        const cryptoTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_crypto')
        )

        cryptoTxs.forEach(tx => {
          expect(tx.metadata?.merchant_category).toBe('cryptocurrency')
        })
      })

      it('should have high risk scores for crypto transactions', async () => {
        const transactions = await client.listTransactions()

        const cryptoTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_crypto')
        )

        cryptoTxs.forEach(tx => {
          const riskScore = parseFloat(tx.metadata?.risk_score || '0')
          expect(riskScore).toBeGreaterThanOrEqual(85)
        })
      })

      it('should have money laundering risk indicator for crypto', async () => {
        const transactions = await client.listTransactions()

        const cryptoTxs = transactions.filter(tx =>
          tx.id.startsWith('pp_crypto')
        )

        const hasMoneyLaunderingRisk = cryptoTxs.some(tx =>
          tx.metadata?.fraud_indicators?.includes('money_laundering_risk')
        )

        expect(hasMoneyLaunderingRisk).toBe(true)
      })
    })
  })

  describe('legitimate transactions', () => {
    it('should generate legitimate transactions with no fraud indicators', async () => {
      const transactions = await client.listTransactions()

      const legitimateTxs = transactions.filter(tx =>
        tx.metadata?.fraud_indicators === 'none'
      )

      expect(legitimateTxs.length).toBeGreaterThan(0)
    })

    it('should have low risk scores for legitimate transactions', async () => {
      const transactions = await client.listTransactions()

      const legitimateTxs = transactions.filter(tx =>
        tx.metadata?.fraud_indicators === 'none'
      )

      legitimateTxs.forEach(tx => {
        const riskScore = parseFloat(tx.metadata?.risk_score || '100')
        expect(riskScore).toBeLessThan(50)
      })
    })

    it('should have card_verified payment method for legitimate transactions', async () => {
      const transactions = await client.listTransactions()

      const legitimateTxs = transactions.filter(tx =>
        tx.id.startsWith('pp_legit')
      )

      legitimateTxs.forEach(tx => {
        expect(tx.payment_method).toBe('card_verified')
      })
    })

    it('should have high success rate for legitimate transactions', async () => {
      const transactions = await client.listTransactions()

      const legitimateTxs = transactions.filter(tx =>
        tx.id.startsWith('pp_legit')
      )

      const succeededCount = legitimateTxs.filter(tx => tx.status === 'succeeded').length
      const successRate = succeededCount / legitimateTxs.length

      // Should have roughly 90% success rate (allowing some variance due to randomness)
      expect(successRate).toBeGreaterThan(0.7)
    })
  })

  describe('transaction metadata', () => {
    it('should have ip_address in metadata', async () => {
      const transactions = await client.listTransactions()

      transactions.forEach(tx => {
        expect(tx.metadata?.ip_address).toBeDefined()
        expect(typeof tx.metadata?.ip_address).toBe('string')
      })
    })

    it('should have risk_score in metadata', async () => {
      const transactions = await client.listTransactions()

      transactions.forEach(tx => {
        expect(tx.metadata?.risk_score).toBeDefined()
      })
    })

    it('should have fraud_indicators in metadata', async () => {
      const transactions = await client.listTransactions()

      transactions.forEach(tx => {
        expect(tx.metadata?.fraud_indicators).toBeDefined()
        expect(typeof tx.metadata?.fraud_indicators).toBe('string')
      })
    })

    it('should have country in metadata', async () => {
      const transactions = await client.listTransactions()

      transactions.forEach(tx => {
        expect(tx.metadata?.country).toBeDefined()
      })
    })
  })

  describe('PayPal-specific features', () => {
    it('should have PayPal-style IDs starting with pp_', async () => {
      const transactions = await client.listTransactions()

      const hasPayPalIds = transactions.every(tx => tx.id.startsWith('pp_'))

      expect(hasPayPalIds).toBe(true)
    })

    it('should have payment_method field', async () => {
      const transactions = await client.listTransactions()

      transactions.forEach(tx => {
        expect(tx.payment_method).toBeDefined()
        expect(typeof tx.payment_method).toBe('string')
      })
    })

    it('should include various payment method types', async () => {
      const transactions = await client.listTransactions()

      const paymentMethods = new Set(transactions.map(tx => tx.payment_method))

      // PayPal mock uses various payment method identifiers
      expect(paymentMethods.size).toBeGreaterThan(1)
    })
  })

  describe('empty results', () => {
    it('should return empty array when no transactions match filters', async () => {
      const transactions = await client.listTransactions({
        amount: { gte: 999999999 } // Extremely high amount
      })

      expect(Array.isArray(transactions)).toBe(true)
      expect(transactions.length).toBe(0)
    })

    it('should return empty array for impossible status + amount combination', async () => {
      // Card testing transactions are small and mostly failed
      // High amounts should not match card testing pattern
      const transactions = await client.listTransactions({
        currency: 'xyz' // Non-existent currency
      })

      expect(transactions.length).toBe(0)
    })
  })
})
