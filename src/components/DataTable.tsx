'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Database, ShieldAlert } from 'lucide-react'
import { TransactionData } from '@/types'

interface DataTableProps {
  data: TransactionData[]
  onSelectTransaction?: (transaction: TransactionData) => void
}

type SortField = keyof TransactionData | 'risk_score'
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const

export default function DataTable({ data, onSelectTransaction }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(50)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getRiskScore = (t: TransactionData): number => parseInt(t.metadata?.risk_score) || 0

  const getRiskConfig = (score: number) => {
    if (score >= 85) return { label: 'CRIT', className: 'bg-risk-critical-bg border-risk-critical-border text-risk-critical-text' }
    if (score >= 70) return { label: 'HIGH', className: 'bg-risk-high-bg border-risk-high-border text-risk-high-text' }
    if (score >= 40) return { label: 'MED', className: 'bg-risk-medium-bg border-risk-medium-border text-risk-medium-text' }
    return { label: 'LOW', className: 'bg-risk-low-bg border-risk-low-border text-risk-low-text' }
  }

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortField === 'risk_score') {
        const aScore = getRiskScore(a)
        const bScore = getRiskScore(b)
        const comparison = aScore - bScore
        return sortDirection === 'asc' ? comparison : -comparison
      }

      const aValue = a[sortField as keyof TransactionData]
      const bValue = b[sortField as keyof TransactionData]

      if (aValue === bValue) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedData = sortedData.slice((safePage - 1) * pageSize, safePage * pageSize)

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
    const date = new Date(timestamp * 1000)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'succeeded':
        return {
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          className: 'bg-status-success-bg border-status-success-border text-status-success-text',
          glow: ''
        }
      case 'failed':
        return {
          icon: <XCircle className="h-3.5 w-3.5" />,
          className: 'bg-status-failed-bg border-status-failed-border text-status-failed-text',
          glow: 'shadow-glow-critical/30'
        }
      case 'pending':
        return {
          icon: <Clock className="h-3.5 w-3.5" />,
          className: 'bg-status-pending-bg border-status-pending-border text-status-pending-text',
          glow: ''
        }
      case 'canceled':
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          className: 'bg-status-canceled-bg border-status-canceled-border text-status-canceled-text',
          glow: ''
        }
      default:
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          className: 'bg-space-700 border-border text-text-tertiary',
          glow: ''
        }
    }
  }

  const getStripeTransactionUrl = (transactionId: string) => {
    if (!transactionId || typeof transactionId !== 'string') {
      return null
    }
    if (transactionId.startsWith('pi_') || transactionId.startsWith('ch_')) {
      return `https://dashboard.stripe.com/test/payments/${transactionId}`
    } else if (transactionId.startsWith('pp_')) {
      return null
    }
    return `https://dashboard.stripe.com/test/payments/${transactionId}`
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1.5 hover:text-terminal-300 transition-colors group"
    >
      <span>{children}</span>
      <span className={`transition-opacity ${sortField === field ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        {sortField === field && sortDirection === 'asc' ? (
          <ChevronUp className="h-3.5 w-3.5 text-terminal-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-terminal-400" />
        )}
      </span>
    </button>
  )

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 space-y-3" data-testid="data-table">
        <Database className="h-10 w-10 text-space-500 mx-auto" />
        <p className="text-text-secondary">No transactions found for your query.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="data-table">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary">
            Transaction Data
          </h3>
          <span className="px-2.5 py-1 bg-terminal-900/50 border border-terminal-400/30 rounded text-xs font-mono text-terminal-300">
            {data.length} records
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-border bg-space-800">
        <table className="min-w-full">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-border bg-space-900">
              <th className="px-4 py-3 text-left">
                <SortButton field="id">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                    ID
                  </span>
                </SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="processor">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                    Processor
                  </span>
                </SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="amount">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                    Amount
                  </span>
                </SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="status">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                    Status
                  </span>
                </SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="risk_score">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                    Risk
                  </span>
                </SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="created">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                    Timestamp
                  </span>
                </SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                  Customer
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
                  Description
                </span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border-subtle">
            {paginatedData.map((transaction, index) => {
              const stripeUrl = getStripeTransactionUrl(transaction.id)
              const statusConfig = getStatusConfig(transaction.status)
              const formattedDate = formatDate(transaction.created)

              return (
                <tr
                  key={transaction.id}
                  className={`hover:bg-space-700/50 transition-colors duration-150 ${onSelectTransaction ? 'cursor-pointer' : ''}`}
                  style={{ animationDelay: `${index * 20}ms` }}
                  onClick={() => onSelectTransaction?.(transaction)}
                >
                  {/* ID Column */}
                  <td className="px-4 py-3">
                    {stripeUrl ? (
                      <a
                        href={stripeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-terminal-300 hover:text-terminal-200 transition-colors group"
                        title="View in Stripe Dashboard"
                      >
                        <span className="font-mono text-sm">
                          {transaction.id?.slice(0, 18)}...
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <span className="font-mono text-sm text-text-mono">
                        {transaction.id?.slice(0, 18)}...
                      </span>
                    )}
                  </td>

                  {/* Processor Column */}
                  <td className="px-4 py-3">
                    {transaction.processor ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium uppercase
                        ${transaction.processor === 'stripe'
                          ? 'bg-processor-stripe-bg border-processor-stripe-border text-processor-stripe-text'
                          : transaction.processor === 'paypal'
                          ? 'bg-processor-paypal-bg border-processor-paypal-border text-processor-paypal-text'
                          : 'bg-processor-adyen-bg border-processor-adyen-border text-processor-adyen-text'
                        }`}>
                        {transaction.processor}
                      </span>
                    ) : (
                      <span className="text-text-tertiary text-sm">—</span>
                    )}
                  </td>

                  {/* Amount Column */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-text-primary tabular-nums">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                    <span className="ml-1.5 text-xs text-text-tertiary uppercase">
                      {transaction.currency}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded border text-xs font-medium ${statusConfig.className} ${statusConfig.glow}`}>
                      {statusConfig.icon}
                      <span className="uppercase tracking-wide">
                        {transaction.original_status || transaction.status}
                      </span>
                    </div>
                  </td>

                  {/* Risk Score Column */}
                  <td className="px-4 py-3">
                    {transaction.metadata?.risk_score ? (() => {
                      const score = parseInt(transaction.metadata.risk_score)
                      const riskConfig = getRiskConfig(score)
                      return (
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono font-medium ${riskConfig.className}`}>
                          <ShieldAlert className="h-3 w-3" />
                          <span>{score}</span>
                        </div>
                      )
                    })() : (
                      <span className="text-text-tertiary text-sm">—</span>
                    )}
                  </td>

                  {/* Date Column */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-text-primary">
                        {formattedDate.time}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formattedDate.date}
                      </span>
                    </div>
                  </td>

                  {/* Customer Column */}
                  <td className="px-4 py-3">
                    {transaction.customer ? (
                      <span className="font-mono text-sm text-text-mono">
                        {transaction.customer.slice(0, 12)}...
                      </span>
                    ) : (
                      <span className="text-text-tertiary text-sm">—</span>
                    )}
                  </td>

                  {/* Description Column */}
                  <td className="px-4 py-3">
                    {transaction.description ? (
                      <span className="text-sm text-text-secondary line-clamp-1 max-w-[200px]">
                        {transaction.description}
                      </span>
                    ) : (
                      <span className="text-text-tertiary text-sm">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedData.length > PAGE_SIZE_OPTIONS[0] && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-tertiary font-mono">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
              className="bg-space-700 border border-border rounded px-2 py-1 text-xs font-mono text-text-primary focus:border-terminal-400 focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-text-tertiary font-mono">
              {((safePage - 1) * pageSize) + 1}–{Math.min(safePage * pageSize, sortedData.length)} of {sortedData.length}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1 rounded hover:bg-space-700 text-text-secondary hover:text-terminal-300 disabled:text-space-600 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-text-secondary px-2">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1 rounded hover:bg-space-700 text-text-secondary hover:text-terminal-300 disabled:text-space-600 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
