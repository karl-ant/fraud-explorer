import AdyenMockClient from './adyen-mock'

describe('AdyenMockClient', () => {
  let client: AdyenMockClient

  beforeEach(() => {
    client = new AdyenMockClient()
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
        expect(tx.processor).toBe('adyen')
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
      it('should filter by EUR currency', async () => {
        const transactions = await client.listTransactions({ currency: 'eur' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.currency).toBe('eur')
        })
      })

      it('should filter by USD currency', async () => {
        const transactions = await client.listTransactions({ currency: 'usd' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.currency).toBe('usd')
        })
      })

      it('should filter by GBP currency', async () => {
        const transactions = await client.listTransactions({ currency: 'gbp' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.currency).toBe('gbp')
        })
      })
    })

    describe('country filter', () => {
      it('should filter by country NL (Netherlands)', async () => {
        const transactions = await client.listTransactions({ country: 'NL' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.metadata?.country).toBe('NL')
        })
      })

      it('should filter by country GB (United Kingdom)', async () => {
        const transactions = await client.listTransactions({ country: 'GB' })

        expect(transactions.length).toBeGreaterThan(0)
        transactions.forEach(tx => {
          expect(tx.metadata?.country).toBe('GB')
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
          currency: 'eur',
          limit
        })

        expect(transactions.length).toBeLessThanOrEqual(limit)
        transactions.forEach(tx => {
          expect(tx.status).toBe('succeeded')
          expect(tx.currency).toBe('eur')
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
          tx.metadata?.fraud_indicators?.includes('card_testing')
        )

        cardTestingTxs.forEach(tx => {
          expect(tx.amount).toBeLessThan(500) // Less than $5
        })
      })

      it('should have rapid succession indicator for card testing', async () => {
        const transactions = await client.listTransactions()

        const cardTestingTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('card_testing')
        )

        cardTestingTxs.forEach(tx => {
          expect(tx.metadata?.fraud_indicators).toContain('rapid_succession')
        })
      })
    })

    describe('3DS failure pattern', () => {
      it('should generate 3DS failure transactions', async () => {
        const transactions = await client.listTransactions()

        const threeDSTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('3ds_failed') ||
          tx.metadata?.fraud_indicators?.includes('3ds_timeout')
        )

        expect(threeDSTxs.length).toBeGreaterThan(0)
      })

      it('should have failed status for 3DS failures', async () => {
        const transactions = await client.listTransactions()

        const threeDSTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('3ds_failed')
        )

        threeDSTxs.forEach(tx => {
          expect(tx.status).toBe('failed')
        })
      })

      it('should have authentication_result metadata for 3DS failures', async () => {
        const transactions = await client.listTransactions()

        const threeDSTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('3ds_failed')
        )

        threeDSTxs.forEach(tx => {
          expect(tx.metadata?.authentication_result).toBeDefined()
        })
      })
    })

    describe('EU cross-border pattern', () => {
      it('should generate EU cross-border transactions', async () => {
        const transactions = await client.listTransactions()

        const crossBorderTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('cross_border')
        )

        expect(crossBorderTxs.length).toBeGreaterThan(0)
      })

      it('should have high value for cross-border transactions', async () => {
        const transactions = await client.listTransactions()

        const crossBorderTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('cross_border')
        )

        crossBorderTxs.forEach(tx => {
          expect(tx.amount).toBeGreaterThan(100000) // Greater than $1000
        })
      })

      it('should have destination_country metadata for cross-border', async () => {
        const transactions = await client.listTransactions()

        const crossBorderTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('cross_border')
        )

        crossBorderTxs.forEach(tx => {
          expect(tx.metadata?.destination_country).toBeDefined()
        })
      })
    })

    describe('account takeover pattern', () => {
      it('should generate account takeover transactions', async () => {
        const transactions = await client.listTransactions()

        const atoTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('account_takeover')
        )

        expect(atoTxs.length).toBeGreaterThan(0)
      })

      it('should have device_fingerprint_mismatch for ATO', async () => {
        const transactions = await client.listTransactions()

        const atoTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('account_takeover')
        )

        atoTxs.forEach(tx => {
          expect(tx.metadata?.device_fingerprint_mismatch).toBe('true')
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

      it('should have gaming merchant for velocity fraud', async () => {
        const transactions = await client.listTransactions()

        const velocityTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('velocity_fraud')
        )

        velocityTxs.forEach(tx => {
          expect(tx.metadata?.merchant_category).toBe('gaming')
        })
      })
    })

    describe('high-risk country pattern', () => {
      it('should generate high-risk country transactions', async () => {
        const transactions = await client.listTransactions()

        const highRiskTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('high_risk_country')
        )

        expect(highRiskTxs.length).toBeGreaterThan(0)
      })

      it('should have card_country_mismatch for high-risk country transactions', async () => {
        const transactions = await client.listTransactions()

        const highRiskTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('high_risk_country')
        )

        highRiskTxs.forEach(tx => {
          expect(tx.metadata?.card_country_mismatch).toBe('true')
        })
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

      it('should have round amounts (divisible by 10000)', async () => {
        const transactions = await client.listTransactions()

        const roundTxs = transactions.filter(tx =>
          tx.metadata?.fraud_indicators?.includes('round_amount')
        )

        roundTxs.forEach(tx => {
          expect(tx.amount % 10000).toBe(0)
        })
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

    it('should have 3DS authentication for legitimate transactions', async () => {
      const transactions = await client.listTransactions()

      const legitimateTxs = transactions.filter(tx =>
        tx.metadata?.fraud_indicators === 'none'
      )

      legitimateTxs.forEach(tx => {
        expect(tx.metadata?.authentication_result).toBe('3ds_authenticated')
      })
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
  })

  describe('Adyen-specific features', () => {
    it('should have Adyen-style IDs', async () => {
      const transactions = await client.listTransactions()

      // Check various ID formats used by Adyen
      const hasAdyenStyleIds = transactions.some(tx =>
        tx.id.startsWith('8816') ||
        tx.id.startsWith('psp_') ||
        tx.id.startsWith('ady_')
      )

      expect(hasAdyenStyleIds).toBe(true)
    })

    it('should include EU-specific payment methods', async () => {
      const transactions = await client.listTransactions()

      const paymentMethods = new Set(transactions.map(tx => tx.payment_method))

      // Adyen supports various EU payment methods
      const euMethods = ['ideal', 'sepadirectdebit', 'giropay', 'bankTransfer_IBAN']
      const hasEuMethods = euMethods.some(method => paymentMethods.has(method))

      expect(hasEuMethods).toBe(true)
    })

    it('should include scheme payment method (cards)', async () => {
      const transactions = await client.listTransactions()

      const cardTransactions = transactions.filter(tx => tx.payment_method === 'scheme')

      expect(cardTransactions.length).toBeGreaterThan(0)
    })
  })
})
