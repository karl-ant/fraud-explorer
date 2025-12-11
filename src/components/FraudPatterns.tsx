'use client'

import { useState } from 'react'
import { AlertTriangle, Shield, AlertCircle, Info, ChevronRight, ChevronDown, Target, Crosshair } from 'lucide-react'
import { FraudPattern } from '@/types'

interface FraudPatternsProps {
  patterns: FraudPattern[]
  onFilterTransactions?: (transactionIds: string[]) => void
}

export default function FraudPatterns({ patterns, onFilterTransactions }: FraudPatternsProps) {
  const [expandedPatterns, setExpandedPatterns] = useState<Set<number>>(new Set())

  const togglePattern = (index: number) => {
    setExpandedPatterns(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const getRiskConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          cardClass: 'bg-risk-critical-surface border-2 border-risk-critical-border',
          glowClass: 'shadow-glow-critical animate-pulse-critical',
          iconClass: 'text-risk-critical-glow',
          titleClass: 'text-risk-critical-text',
          badgeClass: 'bg-risk-critical-bg border border-risk-critical-border text-risk-critical-text shadow-glow-critical/50',
          textClass: 'text-risk-critical-text/80',
          accentClass: 'border-risk-critical-border/50',
          buttonHover: 'hover:border-risk-critical-glow hover:shadow-glow-critical/30',
        }
      case 'high':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          cardClass: 'bg-risk-high-surface border-2 border-risk-high-border',
          glowClass: 'shadow-glow-high',
          iconClass: 'text-risk-high-glow',
          titleClass: 'text-risk-high-text',
          badgeClass: 'bg-risk-high-bg border border-risk-high-border text-risk-high-text',
          textClass: 'text-risk-high-text/80',
          accentClass: 'border-risk-high-border/50',
          buttonHover: 'hover:border-risk-high-glow hover:shadow-glow-high/30',
        }
      case 'medium':
        return {
          icon: <Shield className="h-5 w-5" />,
          cardClass: 'bg-risk-medium-surface border-2 border-risk-medium-border',
          glowClass: 'shadow-glow-medium',
          iconClass: 'text-risk-medium-glow',
          titleClass: 'text-risk-medium-text',
          badgeClass: 'bg-risk-medium-bg border border-risk-medium-border text-risk-medium-text',
          textClass: 'text-risk-medium-text/80',
          accentClass: 'border-risk-medium-border/50',
          buttonHover: 'hover:border-risk-medium-glow hover:shadow-glow-medium/30',
        }
      default: // low
        return {
          icon: <Info className="h-5 w-5" />,
          cardClass: 'bg-risk-low-surface border-2 border-risk-low-border',
          glowClass: 'shadow-glow-low',
          iconClass: 'text-risk-low-glow',
          titleClass: 'text-risk-low-text',
          badgeClass: 'bg-risk-low-bg border border-risk-low-border text-risk-low-text',
          textClass: 'text-risk-low-text/80',
          accentClass: 'border-risk-low-border/50',
          buttonHover: 'hover:border-risk-low-glow hover:shadow-glow-low/30',
        }
    }
  }

  const formatPatternType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (!patterns.length) return null

  // Sort patterns by risk level priority
  const riskPriority = { critical: 0, high: 1, medium: 2, low: 3 }
  const sortedPatterns = [...patterns].sort(
    (a, b) => (riskPriority[a.risk_level as keyof typeof riskPriority] ?? 4) -
              (riskPriority[b.risk_level as keyof typeof riskPriority] ?? 4)
  )

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Target className="h-6 w-6 text-risk-critical-glow" />
          <div className="absolute inset-0 bg-risk-critical-glow/20 rounded-full blur-lg animate-pulse-critical" />
        </div>
        <h3 className="text-lg font-display font-bold uppercase tracking-wider text-risk-critical-text">
          Threat Patterns Detected
        </h3>
        <span className="px-2.5 py-1 bg-risk-critical-bg border border-risk-critical-border rounded text-xs font-mono text-risk-critical-text">
          {patterns.length} {patterns.length === 1 ? 'PATTERN' : 'PATTERNS'}
        </span>
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid gap-3">
        {sortedPatterns.map((pattern, index) => {
          const config = getRiskConfig(pattern.risk_level)
          const isExpanded = expandedPatterns.has(index)

          return (
            <div
              key={index}
              className={`rounded-lg overflow-hidden ${config.cardClass} ${isExpanded ? config.glowClass : ''} transition-all duration-300`}
            >
              {/* Clickable Header */}
              <button
                onClick={() => togglePattern(index)}
                className="w-full p-4 flex items-center justify-between text-left group"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`${config.iconClass} flex-shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                      <h4 className={`font-display font-bold uppercase tracking-wide ${config.titleClass}`}>
                        {formatPatternType(pattern.type)}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${config.badgeClass}`}>
                        {pattern.risk_level}
                      </span>
                      <span className={`text-xs font-mono ${config.textClass}`}>
                        {pattern.affected_transactions.length} txn{pattern.affected_transactions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 ml-3 ${config.iconClass} transition-transform duration-300
                             ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Collapsible Content */}
              <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
                <div className="accordion-inner">
                  <div className="px-4 pb-4 space-y-4">
                    {/* Description */}
                    <p className={`text-sm leading-relaxed ${config.textClass}`}>
                      {pattern.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Indicators */}
                      <div className="space-y-2">
                        <h5 className={`text-xs font-semibold uppercase tracking-wider ${config.titleClass}`}>
                          Indicators
                        </h5>
                        <ul className="space-y-1.5">
                          {pattern.indicators.map((indicator, i) => (
                            <li key={i} className={`flex items-start space-x-2 text-sm ${config.textClass}`}>
                              <Crosshair className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
                              <span>{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Affected Transactions */}
                      <div className="space-y-2">
                        <h5 className={`text-xs font-semibold uppercase tracking-wider ${config.titleClass}`}>
                          Affected Transactions
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onFilterTransactions?.(pattern.affected_transactions)
                          }}
                          className={`w-full p-3 rounded-lg bg-space-800/50 border border-border/50
                                    ${config.buttonHover}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-all duration-200 text-left group`}
                          disabled={!onFilterTransactions}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-mono text-sm font-medium ${config.titleClass}`}>
                              {pattern.affected_transactions.length}
                              <span className="text-text-secondary ml-1">
                                {pattern.affected_transactions.length === 1 ? 'transaction' : 'transactions'}
                              </span>
                            </span>
                            {onFilterTransactions && (
                              <span className="flex items-center space-x-1 text-xs font-medium text-terminal-300 group-hover:text-terminal-200 transition-colors">
                                <span>Filter</span>
                                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-text-tertiary truncate">
                            {pattern.affected_transactions.length <= 3 ? (
                              pattern.affected_transactions.map(id => id.substring(0, 12) + '...').join(', ')
                            ) : (
                              <>
                                {pattern.affected_transactions.slice(0, 2).map(id => id.substring(0, 12) + '...').join(', ')}
                                <span className="text-text-secondary"> +{pattern.affected_transactions.length - 2} more</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`border-t ${config.accentClass} pt-4`}>
                      <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${config.titleClass}`}>
                        Recommended Action
                      </h5>
                      <p className={`text-sm font-medium ${config.textClass}`}>
                        {pattern.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
