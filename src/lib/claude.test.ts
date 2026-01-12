// The mock needs to be defined before it's used
// We use a module-level variable that the mock factory references
let mockCreateFn: jest.Mock

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: (...args: unknown[]) => {
          if (!mockCreateFn) {
            throw new Error('Mock not initialized')
          }
          return mockCreateFn(...args)
        }
      }
    }))
  }
})

// Import after mock is set up
import { processQuery } from './claude'

describe('processQuery', () => {
  beforeEach(() => {
    mockCreateFn = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('successful query processing', () => {
    it('should process a simple status query', async () => {
      const mockResponse = {
        filters: {
          status: ['failed'],
          processors: null,
          amount: null,
          currency: null,
          country: null,
          timeRange: null,
          customer: null,
          fraudIndicators: null
        },
        intent: 'transaction_list',
        explanation: 'Show failed transactions'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }]
      })

      const result = await processQuery('show failed transactions')

      expect(result).toEqual(mockResponse)
      expect(mockCreateFn).toHaveBeenCalledTimes(1)
    })

    it('should process a query with amount filter', async () => {
      const mockResponse = {
        filters: {
          status: ['succeeded'],
          processors: null,
          amount: { min: 100000, max: null },
          currency: null,
          country: null,
          timeRange: null,
          customer: null,
          fraudIndicators: null
        },
        intent: 'analysis',
        explanation: 'Show successful transactions over $1000'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }]
      })

      const result = await processQuery('succeeded transactions over $1000')

      expect(result.filters.amount).toEqual({ min: 100000, max: null })
      expect(result.filters.status).toEqual(['succeeded'])
    })

    it('should process a query with country filter', async () => {
      const mockResponse = {
        filters: {
          status: null,
          processors: null,
          amount: null,
          currency: null,
          country: 'NG',
          timeRange: null,
          customer: null,
          fraudIndicators: null
        },
        intent: 'analysis',
        explanation: 'Show transactions from Nigeria'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }]
      })

      const result = await processQuery('transactions from Nigeria')

      expect(result.filters.country).toBe('NG')
    })

    it('should process a query with time range', async () => {
      const mockResponse = {
        filters: {
          status: null,
          processors: null,
          amount: null,
          currency: null,
          country: null,
          timeRange: { relative: 'last_week', start: null, end: null },
          customer: null,
          fraudIndicators: null
        },
        intent: 'transaction_list',
        explanation: 'Show transactions from last week'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }]
      })

      const result = await processQuery('transactions from last week')

      expect(result.filters.timeRange).toEqual({ relative: 'last_week', start: null, end: null })
    })

    it('should process a fraud detection query', async () => {
      const mockResponse = {
        filters: {
          status: null,
          processors: null,
          amount: null,
          currency: null,
          country: null,
          timeRange: null,
          customer: null,
          fraudIndicators: ['card_testing']
        },
        intent: 'fraud_detection',
        explanation: 'Identify card testing fraud patterns'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }]
      })

      const result = await processQuery('show me card testing attempts')

      expect(result.filters.fraudIndicators).toEqual(['card_testing'])
      expect(result.intent).toBe('fraud_detection')
    })

    it('should process a query with processor filter', async () => {
      const mockResponse = {
        filters: {
          status: ['failed'],
          processors: ['adyen'],
          amount: null,
          currency: null,
          country: null,
          timeRange: null,
          customer: null,
          fraudIndicators: null
        },
        intent: 'transaction_list',
        explanation: 'Show failed Adyen transactions'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }]
      })

      const result = await processQuery('failed adyen transactions')

      expect(result.filters.processors).toEqual(['adyen'])
      expect(result.filters.status).toEqual(['failed'])
    })

    it('should process a complex query with multiple filters', async () => {
      const mockResponse = {
        filters: {
          status: ['failed'],
          processors: ['paypal'],
          amount: { min: 100000, max: null },
          currency: 'usd',
          country: 'NG',
          timeRange: { relative: 'last_week', start: null, end: null },
          customer: null,
          fraudIndicators: null
        },
        intent: 'analysis',
        explanation: 'Show failed PayPal transactions over $1000 in USD from Nigeria last week'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }]
      })

      const result = await processQuery('failed paypal transactions over $1000 usd from nigeria last week')

      expect(result.filters.status).toEqual(['failed'])
      expect(result.filters.processors).toEqual(['paypal'])
      expect(result.filters.amount).toEqual({ min: 100000, max: null })
      expect(result.filters.currency).toBe('usd')
      expect(result.filters.country).toBe('NG')
      expect(result.filters.timeRange?.relative).toBe('last_week')
    })
  })

  describe('markdown stripping', () => {
    it('should strip markdown code blocks from response', async () => {
      const mockResponse = {
        filters: {
          status: ['failed'],
          processors: null,
          amount: null,
          currency: null,
          country: null,
          timeRange: null,
          customer: null,
          fraudIndicators: null
        },
        intent: 'transaction_list',
        explanation: 'Show failed transactions'
      }

      // Response wrapped in markdown code block
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: '```json\n' + JSON.stringify(mockResponse) + '\n```' }]
      })

      const result = await processQuery('failed transactions')

      expect(result).toEqual(mockResponse)
    })

    it('should strip markdown code blocks without json language tag', async () => {
      const mockResponse = {
        filters: { status: ['succeeded'] },
        intent: 'transaction_list',
        explanation: 'Show successful transactions'
      }

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: '```\n' + JSON.stringify(mockResponse) + '\n```' }]
      })

      const result = await processQuery('succeeded transactions')

      expect(result.filters.status).toEqual(['succeeded'])
    })
  })

  describe('response validation', () => {
    it('should add empty filters object if not provided', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          intent: 'transaction_list',
          explanation: 'Show all transactions'
        }) }]
      })

      const result = await processQuery('show all transactions')

      expect(result.filters).toBeDefined()
      expect(typeof result.filters).toBe('object')
    })

    it('should replace null filters with empty object', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: null,
          intent: 'transaction_list',
          explanation: 'Show all transactions'
        }) }]
      })

      const result = await processQuery('show all transactions')

      expect(result.filters).toEqual({})
    })

    it('should handle invalid filters type and use empty object', async () => {
      // Suppress console.warn during this test
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: 'invalid',
          intent: 'transaction_list',
          explanation: 'Show transactions'
        }) }]
      })

      const result = await processQuery('show transactions')

      expect(result.filters).toEqual({})
      warnSpy.mockRestore()
    })

    it('should handle invalid intent type and use default', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 123, // Invalid type
          explanation: 'Show transactions'
        }) }]
      })

      const result = await processQuery('show transactions')

      expect(result.intent).toBe('analysis')
      warnSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('should throw error for invalid JSON response', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: 'This is not JSON' }]
      })

      await expect(processQuery('test query')).rejects.toThrow('Failed to parse AI response')

      errorSpy.mockRestore()
    })

    it('should throw user-friendly error for parse failures', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: '{ invalid json }' }]
      })

      await expect(processQuery('test query')).rejects.toThrow('Failed to parse AI response')

      errorSpy.mockRestore()
    })

    it('should throw error for non-text content type', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'image', source: {} }]
      })

      await expect(processQuery('test query')).rejects.toThrow('Unexpected response format from Claude')
    })

    it('should throw error for API key issues', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockCreateFn.mockRejectedValue(new Error('Invalid API key provided'))

      await expect(processQuery('test query')).rejects.toThrow('AI service configuration error. Please check API key.')

      errorSpy.mockRestore()
    })

    it('should pass through other errors', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockCreateFn.mockRejectedValue(new Error('Network timeout'))

      await expect(processQuery('test query')).rejects.toThrow('Network timeout')

      errorSpy.mockRestore()
    })

    it('should handle non-Error objects thrown', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockCreateFn.mockRejectedValue('string error')

      await expect(processQuery('test query')).rejects.toThrow('Failed to process query with Claude')

      errorSpy.mockRestore()
    })

    it('should log error details for debugging', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: 'invalid json with markdown ```' }]
      })

      await expect(processQuery('test query')).rejects.toThrow()

      // Check that debugging info was logged
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Claude response preview'), expect.any(String))
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Response contains markdown code blocks'))

      errorSpy.mockRestore()
    })
  })

  describe('API call configuration', () => {
    it('should call Anthropic API with correct model', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'transaction_list',
          explanation: 'Test'
        }) }]
      })

      await processQuery('test query')

      expect(mockCreateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024
        })
      )
    })

    it('should pass user query in messages', async () => {
      const query = 'show failed transactions over $1000'

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'transaction_list',
          explanation: 'Test'
        }) }]
      })

      await processQuery(query)

      expect(mockCreateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: query }]
        })
      )
    })

    it('should include system prompt', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'transaction_list',
          explanation: 'Test'
        }) }]
      })

      await processQuery('test')

      expect(mockCreateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('fraud analyst assistant')
        })
      )
    })
  })

  describe('intent types', () => {
    it('should handle analysis intent', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'analysis',
          explanation: 'Analyze transaction patterns'
        }) }]
      })

      const result = await processQuery('analyze patterns')

      expect(result.intent).toBe('analysis')
    })

    it('should handle fraud_detection intent', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: { fraudIndicators: ['velocity_fraud'] },
          intent: 'fraud_detection',
          explanation: 'Detect velocity fraud'
        }) }]
      })

      const result = await processQuery('detect velocity fraud')

      expect(result.intent).toBe('fraud_detection')
    })

    it('should handle transaction_list intent', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'transaction_list',
          explanation: 'List transactions'
        }) }]
      })

      const result = await processQuery('list all transactions')

      expect(result.intent).toBe('transaction_list')
    })

    it('should handle summary intent', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'summary',
          explanation: 'Summarize transaction data'
        }) }]
      })

      const result = await processQuery('summarize transactions')

      expect(result.intent).toBe('summary')
    })
  })

  describe('edge cases', () => {
    it('should handle empty query string', async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'transaction_list',
          explanation: 'Show all transactions'
        }) }]
      })

      const result = await processQuery('')

      expect(result).toBeDefined()
      expect(result.filters).toBeDefined()
    })

    it('should handle very long query strings', async () => {
      const longQuery = 'show transactions '.repeat(100)

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: {},
          intent: 'transaction_list',
          explanation: 'Show transactions'
        }) }]
      })

      const result = await processQuery(longQuery)

      expect(result).toBeDefined()
    })

    it('should handle special characters in query', async () => {
      const specialQuery = 'show transactions with $1000+ & <50% risk'

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: { amount: { min: 100000, max: null } },
          intent: 'analysis',
          explanation: 'Show high-value low-risk transactions'
        }) }]
      })

      const result = await processQuery(specialQuery)

      expect(result.filters.amount?.min).toBe(100000)
    })

    it('should handle unicode characters in query', async () => {
      const unicodeQuery = 'transactions from Deutschland'

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: { country: 'DE' },
          intent: 'transaction_list',
          explanation: 'Show transactions from Germany'
        }) }]
      })

      const result = await processQuery(unicodeQuery)

      expect(result.filters.country).toBe('DE')
    })

    it('should preserve explanation field from response', async () => {
      const explanation = 'This query shows all failed transactions from the past week'

      mockCreateFn.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          filters: { status: ['failed'] },
          intent: 'analysis',
          explanation
        }) }]
      })

      const result = await processQuery('failed transactions last week')

      expect(result.explanation).toBe(explanation)
    })
  })
})
