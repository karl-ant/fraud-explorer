'use client'

import { useEffect, useCallback } from 'react'
import { X, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Shield } from 'lucide-react'
import { TransactionData, FraudPattern } from '@/types'

interface TransactionDrawerProps {
  transaction: TransactionData | null
  fraudPatterns: FraudPattern[]
  onClose: () => void
}

export default function TransactionDrawer({ transaction, fraudPatterns, onClose }: TransactionDrawerProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (transaction) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [transaction, handleKeyDown])

  if (!transaction) return null

  const matchedPatterns = fraudPatterns.filter(p =>
    p.affected_transactions.includes(transaction.id)
  )

  const formatCurrency = (amount: number, currency: string) => {
    if (typeof amount !== 'number' || isNaN(amount)) amount = 0
    if (!currency || typeof currency !== 'string') currency = 'usd'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'succeeded':
        return { icon: <CheckCircle className="h-4 w-4" />, className: 'bg-status-success-bg border-status-success-border text-status-success-text' }
      case 'failed':
        return { icon: <XCircle className="h-4 w-4" />, className: 'bg-status-failed-bg border-status-failed-border text-status-failed-text' }
      case 'pending':
        return { icon: <Clock className="h-4 w-4" />, className: 'bg-status-pending-bg border-status-pending-border text-status-pending-text' }
      case 'canceled':
        return { icon: <AlertCircle className="h-4 w-4" />, className: 'bg-status-canceled-bg border-status-canceled-border text-status-canceled-text' }
      default:
        return { icon: <AlertCircle className="h-4 w-4" />, className: 'bg-space-700 border-border text-text-tertiary' }
    }
  }

  const getRiskBadge = (level: string) => {
    const map: Record<string, string> = {
      critical: 'bg-risk-critical-bg border-risk-critical-border text-risk-critical-text',
      high: 'bg-risk-high-bg border-risk-high-border text-risk-high-text',
      medium: 'bg-risk-medium-bg border-risk-medium-border text-risk-medium-text',
      low: 'bg-risk-low-bg border-risk-low-border text-risk-low-text',
    }
    return map[level] || 'bg-space-700 border-border text-text-tertiary'
  }

  const statusConfig = getStatusConfig(transaction.status)
  const dt = formatDateTime(transaction.created)
  const stripeUrl = (transaction.id.startsWith('pi_') || transaction.id.startsWith('ch_'))
    ? `https://dashboard.stripe.com/test/payments/${transaction.id}`
    : null

  const processorColor: Record<string, string> = {
    stripe: 'bg-processor-stripe-bg border-processor-stripe-border text-processor-stripe-text',
    paypal: 'bg-processor-paypal-bg border-processor-paypal-border text-processor-paypal-text',
    adyen: 'bg-processor-adyen-bg border-processor-adyen-border text-processor-adyen-text',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-space-900 border-l border-border z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-space-900 border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-sm text-text-mono truncate">{transaction.id}</span>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium ${statusConfig.className}`}>
              {statusConfig.icon}
              <span className="uppercase">{transaction.original_status || transaction.status}</span>
            </div>
            {transaction.processor && (
              <span className={`px-2 py-1 rounded border text-xs font-medium uppercase ${processorColor[transaction.processor] || ''}`}>
                {transaction.processor}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-space-700 text-text-secondary hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Amount */}
          <Section title="Amount">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-text-primary">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
              <span className="text-sm text-text-tertiary uppercase">{transaction.currency}</span>
            </div>
          </Section>

          {/* Risk Score */}
          {transaction.metadata?.risk_score && (() => {
            const score = parseInt(transaction.metadata.risk_score)
            const riskLevel = score >= 85 ? 'critical' : score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
            const riskLabel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)
            const barColor = {
              critical: 'bg-[rgb(var(--risk-critical-text))]',
              high: 'bg-[rgb(var(--risk-high-text))]',
              medium: 'bg-[rgb(var(--risk-medium-text))]',
              low: 'bg-[rgb(var(--risk-low-text))]',
            }[riskLevel]
            return (
              <Section title="Risk Score">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-mono font-bold text-text-primary">{score}</span>
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium uppercase tracking-wider ${getRiskBadge(riskLevel)}`}>
                      {riskLabel}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-space-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                </div>
              </Section>
            )
          })()}

          {/* Timeline */}
          <Section title="Created">
            <span className="font-mono text-sm text-text-primary">{dt.time}</span>
            <span className="text-sm text-text-secondary ml-2">{dt.date}</span>
          </Section>

          {/* Customer */}
          {transaction.customer && (
            <Section title="Customer">
              <span className="font-mono text-sm text-text-mono">{transaction.customer}</span>
              {transaction.metadata?.country && (
                <span className="ml-2 text-xs text-text-tertiary uppercase">{transaction.metadata.country}</span>
              )}
            </Section>
          )}

          {/* Payment Details */}
          {(transaction.payment_method || transaction.description) && (
            <Section title="Payment Details">
              {transaction.payment_method && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary uppercase font-mono">Method:</span>
                  <span className="text-sm text-text-secondary">{transaction.payment_method}</span>
                </div>
              )}
              {transaction.description && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-tertiary uppercase font-mono">Desc:</span>
                  <span className="text-sm text-text-secondary">{transaction.description}</span>
                </div>
              )}
            </Section>
          )}

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <Section title="Metadata">
              <div className="space-y-1">
                {Object.entries(transaction.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary font-mono">{key}:</span>
                    <span className="text-sm text-text-mono font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Fraud Indicators */}
          {matchedPatterns.length > 0 && (
            <Section title="Fraud Indicators">
              <div className="space-y-2">
                {matchedPatterns.map((pattern, i) => (
                  <div key={i} className="p-3 bg-space-800 border border-border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-risk-critical-text" />
                      <span className="text-sm font-medium text-text-primary capitalize">
                        {pattern.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded border text-xs font-medium uppercase ${getRiskBadge(pattern.risk_level)}`}>
                        {pattern.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Stripe Link */}
          {stripeUrl && (
            <Section title="External">
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-terminal-300 hover:text-terminal-200 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View in Stripe Dashboard</span>
              </a>
            </Section>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">{title}</h4>
      <div>{children}</div>
    </div>
  )
}
