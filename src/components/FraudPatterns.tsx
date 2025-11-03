'use client'

import { AlertTriangle, Shield, AlertCircle, Info } from 'lucide-react'
import { FraudPattern } from '@/types'

interface FraudPatternsProps {
  patterns: FraudPattern[]
  onFilterTransactions?: (transactionIds: string[]) => void
}

export default function FraudPatterns({ patterns, onFilterTransactions }: FraudPatternsProps) {
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      case 'medium':
        return <Shield className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'border-red-300 bg-white'
      case 'high':
        return 'border-orange-300 bg-white'
      case 'medium':
        return 'border-yellow-300 bg-white'
      default:
        return 'border-blue-300 bg-white'
    }
  }

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-gray-700'
      case 'high':
        return 'text-gray-700'
      case 'medium':
        return 'text-gray-700'
      default:
        return 'text-gray-700'
    }
  }

  const getRiskTitleColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (!patterns.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <h3 className="text-xl font-bold text-red-800">Fraud Patterns Detected</h3>
      </div>
      
      <div className="grid gap-4">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className={`border rounded-lg p-5 ${getRiskColor(pattern.risk_level)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getRiskIcon(pattern.risk_level)}
                <div>
                  <h4 className={`font-bold text-lg ${getRiskTitleColor(pattern.risk_level)}`}>
                    {pattern.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getRiskBadgeColor(pattern.risk_level)}`}>
                    {pattern.risk_level} Risk
                  </span>
                </div>
              </div>
            </div>
            
            <p className={`mb-4 ${getRiskTextColor(pattern.risk_level)}`}>
              {pattern.description}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className={`font-medium mb-2 ${getRiskTextColor(pattern.risk_level)}`}>
                  Fraud Indicators:
                </h5>
                <ul className="list-disc list-inside space-y-1">
                  {pattern.indicators.map((indicator, i) => (
                    <li key={i} className={`text-sm ${getRiskTextColor(pattern.risk_level)}`}>
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className={`font-medium mb-2 ${getRiskTextColor(pattern.risk_level)}`}>
                  Affected Transactions:
                </h5>
                <div className={`text-sm ${getRiskTextColor(pattern.risk_level)}`}>
                  <button
                    onClick={() => onFilterTransactions?.(pattern.affected_transactions)}
                    className="hover:bg-gray-100 p-2 rounded border border-gray-200 hover:border-blue-300 transition-colors text-left w-full"
                    disabled={!onFilterTransactions}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {pattern.affected_transactions.length} transaction{pattern.affected_transactions.length > 1 ? 's' : ''}
                      </span>
                      {onFilterTransactions && (
                        <span className="text-xs text-blue-600 font-medium">
                          Click to filter →
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-gray-500 mt-1">
                      {pattern.affected_transactions.length <= 3 ? (
                        <span>
                          {pattern.affected_transactions.map(id => id.substring(0, 15) + '...').join(', ')}
                        </span>
                      ) : (
                        <span>
                          {pattern.affected_transactions.slice(0, 2).map(id => id.substring(0, 15) + '...').join(', ')} +{pattern.affected_transactions.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <h5 className={`font-medium mb-2 ${getRiskTextColor(pattern.risk_level)}`}>
                Recommended Action:
              </h5>
              <p className={`text-sm font-medium ${getRiskTextColor(pattern.risk_level)}`}>
                {pattern.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}