'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Shield, AlertCircle, Info, ChevronRight, Lightbulb } from 'lucide-react'
import { FraudPattern } from '@/types'

interface FraudPatternsProps {
  patterns: FraudPattern[]
  onFilterTransactions?: (transactionIds: string[]) => void
}

export default function FraudPatterns({ patterns, onFilterTransactions }: FraudPatternsProps) {
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-danger" />
      case 'high':
        return <AlertCircle className="h-5 w-5 text-warning" />
      case 'medium':
        return <Shield className="h-5 w-5 text-accent" />
      default:
        return <Info className="h-5 w-5 text-text-secondary" />
    }
  }

  const getRiskStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return {
          card: 'border-l-4 border-l-danger border border-danger/20 bg-danger-muted/30',
          badge: 'bg-danger-muted text-danger border border-danger/20',
          title: 'text-danger',
        }
      case 'high':
        return {
          card: 'border-l-4 border-l-warning border border-warning/20 bg-warning-muted/30',
          badge: 'bg-warning-muted text-warning border border-warning/20',
          title: 'text-warning',
        }
      case 'medium':
        return {
          card: 'border-l-4 border-l-accent border border-accent/20 bg-accent-muted/30',
          badge: 'bg-accent-muted text-accent border border-accent/20',
          title: 'text-accent',
        }
      default:
        return {
          card: 'border-l-4 border-l-text-tertiary border border-border-primary bg-bg-tertiary/30',
          badge: 'bg-bg-tertiary text-text-secondary border border-border-primary',
          title: 'text-text-secondary',
        }
    }
  }

  if (!patterns.length) return null

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-elegant bg-danger-muted border border-danger/20">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-semibold text-text-primary">
            Fraud Patterns Detected
          </h3>
          <p className="text-sm text-text-tertiary">
            {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} identified
          </p>
        </div>
      </div>

      {/* Pattern Cards */}
      <div className="grid gap-4">
        {patterns.map((pattern, index) => {
          const styles = getRiskStyles(pattern.risk_level)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`rounded-elegant p-6 ${styles.card}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getRiskIcon(pattern.risk_level)}
                  <div className="space-y-1">
                    <h4 className={`font-serif font-semibold text-lg ${styles.title}`}>
                      {pattern.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${styles.badge}`}>
                      {pattern.risk_level} Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-text-secondary mb-5 leading-relaxed">
                {pattern.description}
              </p>

              {/* Two Column Content */}
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                {/* Indicators */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Fraud Indicators
                  </h5>
                  <ul className="space-y-2">
                    {pattern.indicators.map((indicator, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary pl-3 border-l border-border-secondary"
                      >
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Affected Transactions */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                    Affected Transactions
                  </h5>
                  <motion.button
                    onClick={() => onFilterTransactions?.(pattern.affected_transactions)}
                    disabled={!onFilterTransactions}
                    className="
                      w-full text-left p-4 rounded-elegant
                      bg-bg-secondary border border-border-primary
                      hover:border-accent hover:shadow-elegant
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      group
                    "
                    whileHover={{ scale: onFilterTransactions ? 1.01 : 1 }}
                    whileTap={{ scale: onFilterTransactions ? 0.99 : 1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">
                        {pattern.affected_transactions.length} transaction{pattern.affected_transactions.length > 1 ? 's' : ''}
                      </span>
                      {onFilterTransactions && (
                        <span className="flex items-center gap-1 text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Filter
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-text-tertiary">
                      {pattern.affected_transactions.length <= 3 ? (
                        <span>
                          {pattern.affected_transactions.map(id => id.substring(0, 12) + '...').join(', ')}
                        </span>
                      ) : (
                        <span>
                          {pattern.affected_transactions.slice(0, 2).map(id => id.substring(0, 12) + '...').join(', ')} +{pattern.affected_transactions.length - 2} more
                        </span>
                      )}
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Recommendation */}
              <div className="pt-4 border-t border-border-primary">
                <div className="flex items-start gap-3 p-4 rounded-elegant bg-bg-tertiary/50">
                  <Lightbulb className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-text-primary mb-1">
                      Recommended Action
                    </h5>
                    <p className="text-sm text-text-secondary">
                      {pattern.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
