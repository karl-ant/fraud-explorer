import { applyClientFilters, ActiveFilters, EMPTY_FILTERS } from './FilterBar'
import { TransactionData } from '@/types'

// Helper to create test transaction data
const createTransaction = (overrides: Partial<TransactionData> = {}): TransactionData => ({
  id: 'txn_test123',
  amount: 5000, // $50.00
  currency: 'usd',
  status: 'succeeded',
  processor: 'stripe',
  created: Date.now(),
  customer: 'John Doe',
  description: 'Test payment for product',
  payment_method: 'card',
  metadata: {},
  ...overrides,
})

// Helper to create filters with defaults
const createFilters = (overrides: Partial<ActiveFilters> = {}): ActiveFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
})

describe('FilterBar', () => {
  describe('applyClientFilters', () => {
    describe('searchQuery filtering', () => {
      it('should not filter when searchQuery is empty', () => {
        const transactions = [
          createTransaction({ id: 'txn_1' }),
          createTransaction({ id: 'txn_2' }),
          createTransaction({ id: 'txn_3' }),
        ]
        const filters = createFilters({ searchQuery: '' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(3)
        expect(result).toEqual(transactions)
      })

      it('should match transaction ID case-insensitively', () => {
        const transactions = [
          createTransaction({ id: 'TXN_ABC123' }),
          createTransaction({ id: 'txn_def456' }),
          createTransaction({ id: 'ord_xyz789' }),
        ]
        const filters = createFilters({ searchQuery: 'abc' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('TXN_ABC123')
      })

      it('should match transaction ID with uppercase query', () => {
        const transactions = [
          createTransaction({ id: 'txn_abc123' }),
          createTransaction({ id: 'txn_def456' }),
        ]
        const filters = createFilters({ searchQuery: 'ABC' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_abc123')
      })

      it('should match customer name case-insensitively', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice Smith' }),
          createTransaction({ id: 'txn_2', customer: 'Bob Johnson' }),
          createTransaction({ id: 'txn_3', customer: 'Charlie Brown' }),
        ]
        const filters = createFilters({ searchQuery: 'alice' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].customer).toBe('Alice Smith')
      })

      it('should match customer name with uppercase query', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'alice smith' }),
          createTransaction({ id: 'txn_2', customer: 'bob johnson' }),
        ]
        const filters = createFilters({ searchQuery: 'SMITH' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].customer).toBe('alice smith')
      })

      it('should match partial customer name', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice Wonderland' }),
          createTransaction({ id: 'txn_2', customer: 'Bob Builder' }),
        ]
        const filters = createFilters({ searchQuery: 'wonder' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].customer).toBe('Alice Wonderland')
      })

      it('should match description case-insensitively', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', description: 'Payment for premium subscription' }),
          createTransaction({ id: 'txn_2', description: 'Order for electronics' }),
          createTransaction({ id: 'txn_3', description: 'Refund processed' }),
        ]
        const filters = createFilters({ searchQuery: 'premium' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].description).toBe('Payment for premium subscription')
      })

      it('should match description with uppercase query', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', description: 'payment for subscription' }),
          createTransaction({ id: 'txn_2', description: 'order for product' }),
        ]
        const filters = createFilters({ searchQuery: 'SUBSCRIPTION' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].description).toBe('payment for subscription')
      })

      it('should match partial description', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', description: 'Monthly subscription renewal' }),
          createTransaction({ id: 'txn_2', description: 'One-time purchase' }),
        ]
        const filters = createFilters({ searchQuery: 'renew' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].description).toBe('Monthly subscription renewal')
      })

      it('should match across multiple fields', () => {
        const transactions = [
          createTransaction({ id: 'txn_abc', customer: 'John', description: 'Payment' }),
          createTransaction({ id: 'txn_def', customer: 'Jane', description: 'ABC Corp invoice' }),
          createTransaction({ id: 'txn_ghi', customer: 'ABC Ltd', description: 'Purchase' }),
        ]
        const filters = createFilters({ searchQuery: 'abc' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(3)
        expect(result.map(t => t.id)).toEqual(['txn_abc', 'txn_def', 'txn_ghi'])
      })

      it('should return empty array when no matches found', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', description: 'Payment' }),
          createTransaction({ id: 'txn_2', customer: 'Bob', description: 'Order' }),
        ]
        const filters = createFilters({ searchQuery: 'nonexistent' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(0)
      })

      it('should handle transactions with undefined customer', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: undefined, description: 'Payment' }),
          createTransaction({ id: 'txn_2', customer: 'Alice', description: 'Order' }),
        ]
        const filters = createFilters({ searchQuery: 'alice' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_2')
      })

      it('should handle transactions with undefined description', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', description: undefined }),
          createTransaction({ id: 'txn_2', customer: 'Bob', description: 'Payment for Alice' }),
        ]
        const filters = createFilters({ searchQuery: 'payment' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_2')
      })

      it('should handle transactions with both customer and description undefined', () => {
        const transactions = [
          createTransaction({ id: 'txn_abc', customer: undefined, description: undefined }),
          createTransaction({ id: 'txn_def', customer: undefined, description: undefined }),
        ]
        const filters = createFilters({ searchQuery: 'abc' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_abc')
      })

      it('should handle empty string customer and description', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: '', description: '' }),
          createTransaction({ id: 'txn_2', customer: 'Alice', description: 'Payment' }),
        ]
        const filters = createFilters({ searchQuery: 'alice' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_2')
      })
    })

    describe('combined filters with searchQuery', () => {
      it('should combine searchQuery with status filter', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', status: 'succeeded' }),
          createTransaction({ id: 'txn_2', customer: 'Alice', status: 'failed' }),
          createTransaction({ id: 'txn_3', customer: 'Bob', status: 'succeeded' }),
        ]
        const filters = createFilters({
          searchQuery: 'alice',
          statuses: ['succeeded'],
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_1')
      })

      it('should combine searchQuery with processor filter', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', processor: 'stripe' }),
          createTransaction({ id: 'txn_2', customer: 'Alice', processor: 'paypal' }),
          createTransaction({ id: 'txn_3', customer: 'Bob', processor: 'stripe' }),
        ]
        const filters = createFilters({
          searchQuery: 'alice',
          processors: ['stripe'],
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_1')
      })

      it('should combine searchQuery with amount minimum filter', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', amount: 10000 }), // $100
          createTransaction({ id: 'txn_2', customer: 'Alice', amount: 5000 }),  // $50
          createTransaction({ id: 'txn_3', customer: 'Bob', amount: 15000 }),   // $150
        ]
        const filters = createFilters({
          searchQuery: 'alice',
          amountMin: '75', // $75
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_1')
      })

      it('should combine searchQuery with amount maximum filter', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', amount: 10000 }), // $100
          createTransaction({ id: 'txn_2', customer: 'Alice', amount: 5000 }),  // $50
          createTransaction({ id: 'txn_3', customer: 'Bob', amount: 15000 }),   // $150
        ]
        const filters = createFilters({
          searchQuery: 'alice',
          amountMax: '75', // $75
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_2')
      })

      it('should combine searchQuery with amount range filter', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', amount: 5000 }),   // $50
          createTransaction({ id: 'txn_2', customer: 'Alice', amount: 10000 }),  // $100
          createTransaction({ id: 'txn_3', customer: 'Alice', amount: 15000 }),  // $150
          createTransaction({ id: 'txn_4', customer: 'Bob', amount: 10000 }),    // $100
        ]
        const filters = createFilters({
          searchQuery: 'alice',
          amountMin: '75',  // $75
          amountMax: '125', // $125
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_2')
      })

      it('should combine searchQuery with all filter types', () => {
        const transactions = [
          createTransaction({
            id: 'txn_1',
            customer: 'Alice',
            status: 'succeeded',
            processor: 'stripe',
            amount: 10000, // $100
          }),
          createTransaction({
            id: 'txn_2',
            customer: 'Alice',
            status: 'failed',
            processor: 'stripe',
            amount: 10000, // $100
          }),
          createTransaction({
            id: 'txn_3',
            customer: 'Alice',
            status: 'succeeded',
            processor: 'paypal',
            amount: 10000, // $100
          }),
          createTransaction({
            id: 'txn_4',
            customer: 'Alice',
            status: 'succeeded',
            processor: 'stripe',
            amount: 5000, // $50
          }),
          createTransaction({
            id: 'txn_5',
            customer: 'Bob',
            status: 'succeeded',
            processor: 'stripe',
            amount: 10000, // $100
          }),
        ]
        const filters = createFilters({
          searchQuery: 'alice',
          statuses: ['succeeded'],
          processors: ['stripe'],
          amountMin: '75',  // $75
          amountMax: '125', // $125
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_1')
      })

      it('should return empty array when searchQuery matches but other filters do not', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', status: 'succeeded' }),
          createTransaction({ id: 'txn_2', customer: 'Alice', status: 'succeeded' }),
        ]
        const filters = createFilters({
          searchQuery: 'alice',
          statuses: ['failed'],
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(0)
      })

      it('should apply searchQuery after other filters reduce dataset', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', customer: 'Alice', status: 'succeeded' }),
          createTransaction({ id: 'txn_2', customer: 'Bob', status: 'succeeded' }),
          createTransaction({ id: 'txn_3', customer: 'Charlie', status: 'failed' }),
        ]
        const filters = createFilters({
          statuses: ['succeeded'],
          searchQuery: 'bob',
        })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('txn_2')
      })
    })

    describe('other filter functionality', () => {
      it('should filter by status', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', status: 'succeeded' }),
          createTransaction({ id: 'txn_2', status: 'failed' }),
        ]
        const filters = createFilters({ statuses: ['succeeded'] })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].status).toBe('succeeded')
      })

      it('should filter by multiple statuses', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', status: 'succeeded' }),
          createTransaction({ id: 'txn_2', status: 'failed' }),
          createTransaction({ id: 'txn_3', status: 'pending' }),
        ]
        const filters = createFilters({ statuses: ['succeeded', 'pending'] })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(2)
        expect(result.map(t => t.status)).toEqual(['succeeded', 'pending'])
      })

      it('should filter by processor', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', processor: 'stripe' }),
          createTransaction({ id: 'txn_2', processor: 'paypal' }),
        ]
        const filters = createFilters({ processors: ['stripe'] })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].processor).toBe('stripe')
      })

      it('should filter by amount minimum', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', amount: 5000 }),  // $50
          createTransaction({ id: 'txn_2', amount: 10000 }), // $100
        ]
        const filters = createFilters({ amountMin: '75' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].amount).toBe(10000)
      })

      it('should filter by amount maximum', () => {
        const transactions = [
          createTransaction({ id: 'txn_1', amount: 5000 }),  // $50
          createTransaction({ id: 'txn_2', amount: 10000 }), // $100
        ]
        const filters = createFilters({ amountMax: '75' })

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(1)
        expect(result[0].amount).toBe(5000)
      })

      it('should return all transactions when no filters applied', () => {
        const transactions = [
          createTransaction({ id: 'txn_1' }),
          createTransaction({ id: 'txn_2' }),
          createTransaction({ id: 'txn_3' }),
        ]
        const filters = EMPTY_FILTERS

        const result = applyClientFilters(transactions, filters)

        expect(result).toHaveLength(3)
        expect(result).toEqual(transactions)
      })
    })
  })
})
