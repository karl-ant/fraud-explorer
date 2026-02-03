import { MockTransactionGenerator, GeneratorConfig } from './mock-generator'

// Helper to create valid default config
const createConfig = (overrides: Partial<GeneratorConfig> = {}): GeneratorConfig => ({
  count: 100,
  processors: ['stripe'],
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31'),
  },
  fraudMix: {
    cardTesting: 10,
    velocityFraud: 10,
    highRiskCountry: 10,
    roundNumber: 5,
    retryAttack: 5,
    cryptoFraud: 5,
    nightTime: 5,
    highValue: 10,
    legitimate: 40,
  },
  statusDistribution: {
    succeeded: 70,
    failed: 20,
    pending: 5,
    canceled: 5,
  },
  ...overrides,
})

describe('MockTransactionGenerator', () => {
  describe('constructor validation', () => {
    it('should accept valid configuration', () => {
      expect(() => new MockTransactionGenerator(createConfig())).not.toThrow()
    })

    describe('count validation', () => {
      it('should reject count less than 1', () => {
        expect(() => new MockTransactionGenerator(createConfig({ count: 0 }))).toThrow(
          'Transaction count must be between 1 and 10,000'
        )
      })

      it('should reject negative count', () => {
        expect(() => new MockTransactionGenerator(createConfig({ count: -5 }))).toThrow(
          'Transaction count must be between 1 and 10,000'
        )
      })

      it('should reject count over 10000', () => {
        expect(() => new MockTransactionGenerator(createConfig({ count: 10001 }))).toThrow(
          'Transaction count must be between 1 and 10,000'
        )
      })

      it('should accept count of 1', () => {
        expect(() => new MockTransactionGenerator(createConfig({ count: 1 }))).not.toThrow()
      })

      it('should accept count of 10000', () => {
        expect(() => new MockTransactionGenerator(createConfig({ count: 10000 }))).not.toThrow()
      })
    })

    describe('fraud mix validation', () => {
      it('should reject fraud mix not summing to 100%', () => {
        const config = createConfig({
          fraudMix: {
            cardTesting: 10,
            velocityFraud: 10,
            highRiskCountry: 10,
            roundNumber: 5,
            retryAttack: 5,
            cryptoFraud: 5,
            nightTime: 5,
            highValue: 10,
            legitimate: 30, // Sum = 90%
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'Fraud mix percentages must sum to 100%'
        )
      })

      it('should reject fraud mix over 100%', () => {
        const config = createConfig({
          fraudMix: {
            cardTesting: 20,
            velocityFraud: 20,
            highRiskCountry: 20,
            roundNumber: 10,
            retryAttack: 10,
            cryptoFraud: 10,
            nightTime: 10,
            highValue: 10,
            legitimate: 10, // Sum = 120%
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'Fraud mix percentages must sum to 100%'
        )
      })

      it('should accept 100% legitimate', () => {
        const config = createConfig({
          fraudMix: {
            cardTesting: 0,
            velocityFraud: 0,
            highRiskCountry: 0,
            roundNumber: 0,
            retryAttack: 0,
            cryptoFraud: 0,
            nightTime: 0,
            highValue: 0,
            legitimate: 100,
          },
        })

        expect(() => new MockTransactionGenerator(config)).not.toThrow()
      })

      it('should accept 0% legitimate', () => {
        const config = createConfig({
          fraudMix: {
            cardTesting: 20,
            velocityFraud: 20,
            highRiskCountry: 15,
            roundNumber: 10,
            retryAttack: 10,
            cryptoFraud: 10,
            nightTime: 5,
            highValue: 10,
            legitimate: 0,
          },
        })

        expect(() => new MockTransactionGenerator(config)).not.toThrow()
      })
    })

    describe('status distribution validation', () => {
      it('should reject status distribution not summing to 100%', () => {
        const config = createConfig({
          statusDistribution: {
            succeeded: 50,
            failed: 20,
            pending: 10,
            canceled: 10, // Sum = 90%
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'Status distribution percentages must sum to 100%'
        )
      })

      it('should reject status distribution over 100%', () => {
        const config = createConfig({
          statusDistribution: {
            succeeded: 80,
            failed: 20,
            pending: 10,
            canceled: 10, // Sum = 120%
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'Status distribution percentages must sum to 100%'
        )
      })

      it('should accept 100% succeeded', () => {
        const config = createConfig({
          statusDistribution: {
            succeeded: 100,
            failed: 0,
            pending: 0,
            canceled: 0,
          },
        })

        expect(() => new MockTransactionGenerator(config)).not.toThrow()
      })
    })

    describe('date range validation', () => {
      it('should reject start date after end date', () => {
        const config = createConfig({
          dateRange: {
            start: new Date('2024-12-31'),
            end: new Date('2024-01-01'),
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'Start date must be before end date'
        )
      })

      it('should accept same start and end date', () => {
        const sameDate = new Date('2024-06-15')
        const config = createConfig({
          dateRange: {
            start: sameDate,
            end: sameDate,
          },
        })

        expect(() => new MockTransactionGenerator(config)).not.toThrow()
      })
    })

    describe('percentage validation', () => {
      it('should reject negative fraud percentages', () => {
        const config = createConfig({
          fraudMix: {
            cardTesting: -10,
            velocityFraud: 10,
            highRiskCountry: 10,
            roundNumber: 5,
            retryAttack: 5,
            cryptoFraud: 5,
            nightTime: 5,
            highValue: 10,
            legitimate: 60, // Compensate to sum to 100
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'All percentages must be between 0 and 100'
        )
      })

      it('should reject negative status percentages', () => {
        const config = createConfig({
          statusDistribution: {
            succeeded: -10,
            failed: 50,
            pending: 30,
            canceled: 30,
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'All percentages must be between 0 and 100'
        )
      })

      it('should reject percentage over 100', () => {
        const config = createConfig({
          statusDistribution: {
            succeeded: 110,
            failed: -10,
            pending: 0,
            canceled: 0,
          },
        })

        expect(() => new MockTransactionGenerator(config)).toThrow(
          'All percentages must be between 0 and 100'
        )
      })
    })
  })

  describe('generate()', () => {
    it('should generate approximately correct number of transactions', () => {
      // Due to rounding in fraud distribution, count may vary slightly
      const generator = new MockTransactionGenerator(createConfig({ count: 50 }))
      const transactions = generator.generate()

      // Allow small variance due to rounding
      expect(transactions.length).toBeGreaterThanOrEqual(45)
      expect(transactions.length).toBeLessThanOrEqual(50)
    })

    it('should generate transactions with correct processor', () => {
      const generator = new MockTransactionGenerator(createConfig({ processors: ['paypal'], count: 10 }))
      const transactions = generator.generate()

      transactions.forEach(t => {
        expect(t.processor).toBe('paypal')
      })
    })

    it('should generate transactions with correct processor prefix', () => {
      const stripeGen = new MockTransactionGenerator(createConfig({ processors: ['stripe'], count: 10 }))
      const paypalGen = new MockTransactionGenerator(createConfig({ processors: ['paypal'], count: 10 }))
      const adyenGen = new MockTransactionGenerator(createConfig({ processors: ['adyen'], count: 10 }))

      const stripeTxns = stripeGen.generate()
      const paypalTxns = paypalGen.generate()
      const adyenTxns = adyenGen.generate()

      stripeTxns.forEach(t => expect(t.id).toMatch(/^ch_/))
      paypalTxns.forEach(t => expect(t.id).toMatch(/^pp_/))
      adyenTxns.forEach(t => expect(t.id).toMatch(/^ady_/))
    })

    it('should generate unique transaction IDs', () => {
      const generator = new MockTransactionGenerator(createConfig({ count: 100 }))
      const transactions = generator.generate()
      const ids = transactions.map(t => t.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should generate transactions within date range', () => {
      const start = new Date('2024-06-01')
      const end = new Date('2024-06-30')
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        dateRange: { start, end },
      }))
      const transactions = generator.generate()

      const startTimestamp = Math.floor(start.getTime() / 1000)
      const endTimestamp = Math.floor(end.getTime() / 1000)

      transactions.forEach(t => {
        expect(t.created).toBeGreaterThanOrEqual(startTimestamp)
        expect(t.created).toBeLessThanOrEqual(endTimestamp)
      })
    })

    it('should respect status distribution approximately', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 1000,
        statusDistribution: {
          succeeded: 50,
          failed: 30,
          pending: 15,
          canceled: 5,
        },
      }))
      const transactions = generator.generate()

      const counts = {
        succeeded: transactions.filter(t => t.status === 'succeeded').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        canceled: transactions.filter(t => t.status === 'canceled').length,
      }

      // Allow 5% tolerance due to rounding
      expect(counts.succeeded).toBeGreaterThan(450)
      expect(counts.succeeded).toBeLessThan(550)
      expect(counts.failed).toBeGreaterThan(250)
      expect(counts.failed).toBeLessThan(350)
      expect(counts.pending).toBeGreaterThan(100)
      expect(counts.pending).toBeLessThan(200)
      expect(counts.canceled).toBeGreaterThan(20)
      expect(counts.canceled).toBeLessThan(100)
    })

    it('should generate only legitimate transactions when fraud is 0%', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 100,
        },
      }))
      const transactions = generator.generate()

      transactions.forEach(t => {
        expect(t.id).toMatch(/_legit_/)
      })
    })

    it('should generate no legitimate transactions when legitimate is 0%', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 100,
        fraudMix: {
          cardTesting: 25,
          velocityFraud: 25,
          highRiskCountry: 25,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 25,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const legitCount = transactions.filter(t => t.id.includes('_legit_')).length
      expect(legitCount).toBe(0)
    })
  })

  describe('fraud pattern generation', () => {
    it('should generate card testing transactions with small amounts', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 100,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const cardTestingTxns = transactions.filter(t => t.id.includes('_ct_'))
      expect(cardTestingTxns.length).toBeGreaterThan(0)

      cardTestingTxns.forEach(t => {
        expect(t.amount).toBeLessThan(400) // $0.50-$3.50
        expect(t.metadata?.fraud_indicators).toContain('card_testing')
      })
    })

    it('should generate high-risk country transactions with correct metadata', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 100,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const highRiskTxns = transactions.filter(t => t.id.includes('_hrisk_'))
      expect(highRiskTxns.length).toBeGreaterThan(0)

      const highRiskCountries = ['NG', 'GH', 'ID', 'PK', 'BD', 'VN']
      highRiskTxns.forEach(t => {
        expect(highRiskCountries).toContain(t.metadata?.country)
      })
    })

    it('should generate round number transactions with multiples of $500 or $1000', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 100,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const roundTxns = transactions.filter(t => t.id.includes('_round_'))
      expect(roundTxns.length).toBeGreaterThan(0)

      const expectedAmounts = [500000, 1000000, 250000, 750000, 2000000]
      roundTxns.forEach(t => {
        expect(expectedAmounts).toContain(t.amount)
      })
    })

    it('should generate crypto fraud transactions with cryptocurrency metadata', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 100,
          nightTime: 0,
          highValue: 0,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const cryptoTxns = transactions.filter(t => t.id.includes('_crypto_'))
      expect(cryptoTxns.length).toBeGreaterThan(0)

      cryptoTxns.forEach(t => {
        expect(t.metadata?.merchant_category).toBe('cryptocurrency')
        expect(t.description).toContain('Cryptocurrency')
      })
    })

    it('should generate night time transactions with off-hours metadata', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 100,
          highValue: 0,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const nightTxns = transactions.filter(t => t.id.includes('_night_'))
      expect(nightTxns.length).toBeGreaterThan(0)

      nightTxns.forEach(t => {
        expect(t.metadata?.fraud_indicators).toContain('off_hours')
        expect(t.metadata?.transaction_hour).toBe('03')
      })
    })

    it('should generate retry attack transactions with attempt numbers', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 100,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const retryTxns = transactions.filter(t => t.id.includes('_retry_'))
      expect(retryTxns.length).toBeGreaterThan(0)

      retryTxns.forEach(t => {
        expect(t.metadata?.attempt_number).toBeDefined()
      })
    })

    it('should generate high value transactions >= $5000', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 100,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const highValueTxns = transactions.filter(t => t.id.includes('_hval_'))
      expect(highValueTxns.length).toBeGreaterThan(0)

      highValueTxns.forEach(t => {
        expect(t.amount).toBeGreaterThanOrEqual(500000) // $5000+
      })
    })

    it('should generate velocity fraud transactions with gaming merchant', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 100,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 0,
        },
      }))
      const transactions = generator.generate()

      const velocityTxns = transactions.filter(t => t.id.includes('_vel_'))
      expect(velocityTxns.length).toBeGreaterThan(0)

      velocityTxns.forEach(t => {
        expect(t.metadata?.merchant_category).toBe('gaming')
        expect(t.metadata?.fraud_indicators).toContain('velocity_fraud')
      })
    })
  })

  describe('processor-specific behavior', () => {
    it('should use USD for Stripe transactions', () => {
      const generator = new MockTransactionGenerator(createConfig({ processors: ['stripe'], count: 10 }))
      const transactions = generator.generate()

      transactions.forEach(t => {
        expect(t.currency).toBe('usd')
      })
    })

    it('should use USD for PayPal transactions', () => {
      const generator = new MockTransactionGenerator(createConfig({ processors: ['paypal'], count: 10 }))
      const transactions = generator.generate()

      transactions.forEach(t => {
        expect(t.currency).toBe('usd')
      })
    })

    it('should use EUR for Adyen legitimate transactions', () => {
      // Note: Some fraud patterns hardcode 'usd', so we test only legitimate transactions
      const generator = new MockTransactionGenerator(createConfig({
        processors: ['adyen'],
        count: 20,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 100,
        },
      }))
      const transactions = generator.generate()

      transactions.forEach(t => {
        expect(t.currency).toBe('eur')
      })
    })
  })

  describe('legitimate transaction generation', () => {
    it('should generate legitimate transactions with low risk scores', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 100,
        },
      }))
      const transactions = generator.generate()

      transactions.forEach(t => {
        const riskScore = parseInt(t.metadata?.risk_score || '0')
        expect(riskScore).toBeLessThan(50) // Low risk
        expect(t.metadata?.fraud_indicators).toBe('none')
      })
    })

    it('should generate legitimate transactions from common countries', () => {
      const generator = new MockTransactionGenerator(createConfig({
        count: 100,
        fraudMix: {
          cardTesting: 0,
          velocityFraud: 0,
          highRiskCountry: 0,
          roundNumber: 0,
          retryAttack: 0,
          cryptoFraud: 0,
          nightTime: 0,
          highValue: 0,
          legitimate: 100,
        },
      }))
      const transactions = generator.generate()

      const commonCountries = ['US', 'CA', 'GB', 'AU', 'DE', 'FR']
      transactions.forEach(t => {
        expect(commonCountries).toContain(t.metadata?.country)
      })
    })
  })

  describe('multi-processor generation', () => {
    it('should reject empty processors array', () => {
      expect(() => new MockTransactionGenerator(createConfig({ processors: [] }))).toThrow(
        'At least one processor must be selected'
      )
    })

    it('should generate transactions across all selected processors', () => {
      const generator = new MockTransactionGenerator(createConfig({
        processors: ['stripe', 'paypal', 'adyen'],
        count: 90,
      }))
      const transactions = generator.generate()

      const processors = new Set(transactions.map(t => t.processor))
      expect(processors).toContain('stripe')
      expect(processors).toContain('paypal')
      expect(processors).toContain('adyen')
    })

    it('should split count roughly evenly across processors', () => {
      const generator = new MockTransactionGenerator(createConfig({
        processors: ['stripe', 'paypal', 'adyen'],
        count: 90,
        fraudMix: {
          cardTesting: 0, velocityFraud: 0, highRiskCountry: 0, roundNumber: 0,
          retryAttack: 0, cryptoFraud: 0, nightTime: 0, highValue: 0, legitimate: 100,
        },
      }))
      const transactions = generator.generate()

      const stripeTxns = transactions.filter(t => t.processor === 'stripe')
      const paypalTxns = transactions.filter(t => t.processor === 'paypal')
      const adyenTxns = transactions.filter(t => t.processor === 'adyen')

      expect(stripeTxns.length).toBe(30)
      expect(paypalTxns.length).toBe(30)
      expect(adyenTxns.length).toBe(30)
    })

    it('should use correct prefix and currency per processor', () => {
      const generator = new MockTransactionGenerator(createConfig({
        processors: ['stripe', 'paypal', 'adyen'],
        count: 30,
        fraudMix: {
          cardTesting: 0, velocityFraud: 0, highRiskCountry: 0, roundNumber: 0,
          retryAttack: 0, cryptoFraud: 0, nightTime: 0, highValue: 0, legitimate: 100,
        },
      }))
      const transactions = generator.generate()

      transactions.filter(t => t.processor === 'stripe').forEach(t => {
        expect(t.id).toMatch(/^ch_/)
        expect(t.currency).toBe('usd')
      })
      transactions.filter(t => t.processor === 'paypal').forEach(t => {
        expect(t.id).toMatch(/^pp_/)
        expect(t.currency).toBe('usd')
      })
      transactions.filter(t => t.processor === 'adyen').forEach(t => {
        expect(t.id).toMatch(/^ady_/)
        expect(t.currency).toBe('eur')
      })
    })

    it('should handle remainder when count not evenly divisible', () => {
      const generator = new MockTransactionGenerator(createConfig({
        processors: ['stripe', 'paypal', 'adyen'],
        count: 10,
        fraudMix: {
          cardTesting: 0, velocityFraud: 0, highRiskCountry: 0, roundNumber: 0,
          retryAttack: 0, cryptoFraud: 0, nightTime: 0, highValue: 0, legitimate: 100,
        },
      }))
      const transactions = generator.generate()

      // 10 / 3 = 3 per processor + 1 remainder -> first processor gets 4
      expect(transactions.length).toBe(10)
    })
  })

  describe('risk score ranges per fraud type', () => {
    const fraudOnlyConfig = (fraudKey: string) => createConfig({
      count: 50,
      fraudMix: {
        cardTesting: fraudKey === 'cardTesting' ? 100 : 0,
        velocityFraud: fraudKey === 'velocityFraud' ? 100 : 0,
        highRiskCountry: fraudKey === 'highRiskCountry' ? 100 : 0,
        roundNumber: fraudKey === 'roundNumber' ? 100 : 0,
        retryAttack: fraudKey === 'retryAttack' ? 100 : 0,
        cryptoFraud: fraudKey === 'cryptoFraud' ? 100 : 0,
        nightTime: fraudKey === 'nightTime' ? 100 : 0,
        highValue: fraudKey === 'highValue' ? 100 : 0,
        legitimate: 0,
      },
    })

    it('should generate high risk scores for card testing (85-99)', () => {
      const transactions = new MockTransactionGenerator(fraudOnlyConfig('cardTesting')).generate()
      transactions.forEach(t => {
        const score = parseInt(t.metadata?.risk_score || '0', 10)
        expect(score).toBeGreaterThanOrEqual(85)
        expect(score).toBeLessThan(100)
      })
    })

    it('should generate high risk scores for velocity fraud (80-94)', () => {
      const transactions = new MockTransactionGenerator(fraudOnlyConfig('velocityFraud')).generate()
      transactions.forEach(t => {
        const score = parseInt(t.metadata?.risk_score || '0', 10)
        expect(score).toBeGreaterThanOrEqual(80)
        expect(score).toBeLessThan(100)
      })
    })

    it('should generate high risk scores for crypto fraud (85-94)', () => {
      const transactions = new MockTransactionGenerator(fraudOnlyConfig('cryptoFraud')).generate()
      transactions.forEach(t => {
        const score = parseInt(t.metadata?.risk_score || '0', 10)
        expect(score).toBeGreaterThanOrEqual(85)
        expect(score).toBeLessThan(100)
      })
    })

    it('should generate moderate risk scores for round numbers (65)', () => {
      const transactions = new MockTransactionGenerator(fraudOnlyConfig('roundNumber')).generate()
      transactions.forEach(t => {
        const score = parseInt(t.metadata?.risk_score || '0', 10)
        expect(score).toBe(65)
      })
    })

    it('should generate low risk scores for legitimate transactions (10-39)', () => {
      const transactions = new MockTransactionGenerator(createConfig({
        count: 50,
        fraudMix: {
          cardTesting: 0, velocityFraud: 0, highRiskCountry: 0, roundNumber: 0,
          retryAttack: 0, cryptoFraud: 0, nightTime: 0, highValue: 0, legitimate: 100,
        },
      })).generate()
      transactions.forEach(t => {
        const score = parseInt(t.metadata?.risk_score || '0', 10)
        expect(score).toBeGreaterThanOrEqual(10)
        expect(score).toBeLessThan(40)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle count of 1', () => {
      const generator = new MockTransactionGenerator(createConfig({ count: 1 }))
      const transactions = generator.generate()

      expect(transactions.length).toBe(1)
    })

    it('should handle large count efficiently', () => {
      const startTime = Date.now()
      const generator = new MockTransactionGenerator(createConfig({ count: 5000 }))
      const transactions = generator.generate()
      const endTime = Date.now()

      expect(transactions.length).toBe(5000)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should generate valid IP addresses', () => {
      const generator = new MockTransactionGenerator(createConfig({ count: 50 }))
      const transactions = generator.generate()

      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      transactions.forEach(t => {
        expect(t.metadata?.ip_address).toMatch(ipRegex)
      })
    })
  })
})
