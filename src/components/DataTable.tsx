'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { TransactionData } from '@/types'

interface DataTableProps {
  data: TransactionData[]
}

type SortField = keyof TransactionData
type SortDirection = 'asc' | 'desc'

export default function DataTable({ data }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === bValue) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    
    const comparison = aValue < bValue ? -1 : 1
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const formatCurrency = (amount: number, currency: string) => {
    // Handle invalid amounts
    if (typeof amount !== 'number' || isNaN(amount) || amount === null || amount === undefined) {
      amount = 0
    }
    
    // Handle invalid currency
    if (!currency || typeof currency !== 'string') {
      currency = 'usd'
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'canceled':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStripeTransactionUrl = (transactionId: string) => {
    // Handle different Stripe ID formats
    if (!transactionId || typeof transactionId !== 'string') {
      return null
    }
    
    if (transactionId.startsWith('pi_')) {
      // Payment Intent ID
      return `https://dashboard.stripe.com/test/payments/${transactionId}`
    } else if (transactionId.startsWith('ch_')) {
      // Charge ID - convert to payments URL
      return `https://dashboard.stripe.com/test/payments/${transactionId}`
    } else if (transactionId.startsWith('pp_')) {
      // PayPal transaction - return null (not applicable)
      return null
    }
    
    // Default case - assume it's a payment intent
    return `https://dashboard.stripe.com/test/payments/${transactionId}`
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
      )}
    </button>
  )

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found for your query.
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="data-table">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Transaction Results ({data.length} transactions)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <SortButton field="id">ID</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <SortButton field="amount">Amount</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <SortButton field="created">Date</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((transaction) => {
              const stripeUrl = getStripeTransactionUrl(transaction.id)
              return (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono">
                    {stripeUrl ? (
                      <a
                        href={stripeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="View in Stripe Dashboard"
                      >
                        {transaction.id && typeof transaction.id === 'string' ? transaction.id.slice(0, 20) + '...' : String(transaction.id || 'N/A')}
                      </a>
                    ) : (
                      <span className="text-gray-600">
                        {transaction.id && typeof transaction.id === 'string' ? transaction.id.slice(0, 20) + '...' : String(transaction.id || 'N/A')}
                      </span>
                    )}
                  </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transaction.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.original_status || transaction.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(transaction.created)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {transaction.customer ? (
                    <span className="font-mono">{transaction.customer.slice(0, 15)}...</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {transaction.description || (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}