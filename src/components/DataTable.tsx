'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Inbox } from 'lucide-react'
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
    if (typeof amount !== 'number' || isNaN(amount) || amount === null || amount === undefined) {
      amount = 0
    }
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
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-danger" />
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />
      case 'canceled':
        return <AlertCircle className="h-4 w-4 text-text-tertiary" />
      default:
        return <AlertCircle className="h-4 w-4 text-text-tertiary" />
    }
  }

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-success-muted text-success border border-success/20'
      case 'failed':
        return 'bg-danger-muted text-danger border border-danger/20'
      case 'pending':
        return 'bg-warning-muted text-warning border border-warning/20'
      case 'canceled':
        return 'bg-bg-tertiary text-text-tertiary border border-border-primary'
      default:
        return 'bg-bg-tertiary text-text-tertiary border border-border-primary'
    }
  }

  const getStripeTransactionUrl = (transactionId: string) => {
    if (!transactionId || typeof transactionId !== 'string') {
      return null
    }
    if (transactionId.startsWith('pi_')) {
      return `https://dashboard.stripe.com/test/payments/${transactionId}`
    } else if (transactionId.startsWith('ch_')) {
      return `https://dashboard.stripe.com/test/payments/${transactionId}`
    } else if (transactionId.startsWith('pp_')) {
      return null
    }
    return `https://dashboard.stripe.com/test/payments/${transactionId}`
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1.5 hover:text-accent transition-colors group"
    >
      <span>{children}</span>
      <motion.span
        initial={false}
        animate={{
          rotate: sortField === field && sortDirection === 'desc' ? 180 : 0,
          opacity: sortField === field ? 1 : 0.3,
        }}
        transition={{ duration: 0.2 }}
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </motion.span>
    </button>
  )

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
        data-testid="data-table"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-tertiary mb-4">
          <Inbox className="h-8 w-8 text-text-tertiary" />
        </div>
        <p className="text-text-secondary">No transactions found for your query.</p>
        <p className="text-text-tertiary text-sm mt-1">Try adjusting your search parameters.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4" data-testid="data-table">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-text-primary">
          Transaction Results
        </h3>
        <span className="text-sm text-text-tertiary">
          {data.length} transaction{data.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-elegant border border-border-primary bg-bg-secondary">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border-primary bg-bg-tertiary/50">
              <th className="px-5 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <SortButton field="id">ID</SortButton>
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <SortButton field="amount">Amount</SortButton>
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <SortButton field="created">Date</SortButton>
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Customer
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {sortedData.map((transaction, index) => {
              const stripeUrl = getStripeTransactionUrl(transaction.id)
              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  className="hover:bg-bg-tertiary/50 transition-colors group"
                >
                  <td className="px-5 py-4 text-sm font-mono">
                    {stripeUrl ? (
                      <a
                        href={stripeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-accent transition-colors"
                        title="View in Stripe Dashboard"
                      >
                        <span>
                          {transaction.id && typeof transaction.id === 'string'
                            ? transaction.id.slice(0, 16) + '...'
                            : String(transaction.id || 'N/A')}
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <span className="text-text-tertiary">
                        {transaction.id && typeof transaction.id === 'string'
                          ? transaction.id.slice(0, 16) + '...'
                          : String(transaction.id || 'N/A')}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-text-primary tabular-nums">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusClasses(transaction.status)}`}>
                        {transaction.original_status || transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {formatDate(transaction.created)}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {transaction.customer ? (
                      <span className="font-mono text-xs">
                        {transaction.customer.slice(0, 15)}...
                      </span>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary max-w-xs truncate">
                    {transaction.description || (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
