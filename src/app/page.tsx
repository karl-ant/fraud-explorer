'use client'

import { useState } from 'react'
import { Radar, Shield, AlertTriangle, X } from 'lucide-react'
import QueryInterface from '@/components/QueryInterface'
import DataTable from '@/components/DataTable'
import FraudPatterns from '@/components/FraudPatterns'
import MockTransactionGenerator from '@/components/MockTransactionGenerator'
import { QueryResponse, TransactionData } from '@/types'
import { FraudDetector } from '@/lib/fraud-detector'

export default function Home() {
  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [filteredTransactionIds, setFilteredTransactionIds] = useState<string[] | null>(null)

  const handleQuery = async (query: string, processor: 'stripe' | 'paypal' | 'adyen' | 'all' = 'all', useRealStripe = false) => {
    setLoading(true)
    setFilteredTransactionIds(null)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, processor, useRealStripe })
      })
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({
        data: [],
        error: 'Failed to process query'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMockGenerated = (transactions: TransactionData[]) => {
    // Display generated transactions without making API call
    const fraudPatterns = FraudDetector.analyzeFraudPatterns(transactions)
    setResponse({
      data: transactions,
      summary: `Generated ${transactions.length} mock transactions with ${fraudPatterns.length} fraud patterns detected`,
      fraud_patterns: fraudPatterns
    })
    setFilteredTransactionIds(null)
  }

  const handleFilterTransactions = (transactionIds: string[]) => {
    setFilteredTransactionIds(transactionIds)
    setTimeout(() => {
      const dataTableElement = document.querySelector('[data-testid="data-table"]')
      if (dataTableElement) {
        dataTableElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleClearFilter = () => {
    setFilteredTransactionIds(null)
  }

  const getDisplayedTransactions = () => {
    if (!response?.data) return []
    if (!filteredTransactionIds) return response.data
    return response.data.filter(t => filteredTransactionIds.includes(t.id))
  }

  const hasAlerts = response?.summary?.includes('🚨') || (response?.fraud_patterns && response.fraud_patterns.length > 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mission Control Header */}
      <header className="text-center space-y-4 py-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Animated radar icon */}
          <div className="relative">
            <Radar className="h-10 w-10 text-terminal-300 animate-pulse-slow" />
            <div className="absolute inset-0 h-10 w-10 bg-terminal-300/20 rounded-full blur-xl animate-glow-breathe" />
          </div>

          <h1 className="text-4xl font-display font-bold uppercase tracking-wider text-text-primary text-shadow-glow">
            Fraud Explorer
          </h1>
        </div>

        <p className="text-text-secondary max-w-2xl mx-auto font-sans">
          Unified fraud detection across payment processors.
          Query transaction patterns with natural language analysis.
        </p>
      </header>

      {/* Main Control Panel */}
      <div className="panel p-6 space-y-6">
        <QueryInterface onQuery={handleQuery} loading={loading} />
      </div>

      {/* Mock Transaction Generator */}
      <MockTransactionGenerator onTransactionsGenerated={handleMockGenerated} />

      {/* Results Panel */}
      {response && (
        <div className="panel p-6 space-y-6">{response && (
          <div className="space-y-6 animate-slide-up">
            {/* Analysis Summary */}
            {response.summary && (
              <div className={`rounded-lg p-4 border-l-4 ${
                hasAlerts
                  ? 'bg-risk-critical-bg/50 border-risk-critical-glow'
                  : 'bg-terminal-900/30 border-terminal-400'
              }`}>
                <div className="flex items-start space-x-3">
                  {hasAlerts ? (
                    <AlertTriangle className="h-5 w-5 text-risk-critical-text flex-shrink-0 mt-0.5" />
                  ) : (
                    <Shield className="h-5 w-5 text-terminal-300 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm leading-relaxed ${hasAlerts ? 'text-risk-critical-text' : 'text-text-primary'}`}>
                    {response.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Fraud Patterns Section */}
            {response.fraud_patterns && response.fraud_patterns.length > 0 && (
              <FraudPatterns
                patterns={response.fraud_patterns}
                onFilterTransactions={handleFilterTransactions}
              />
            )}

            {/* Active Filter Indicator */}
            {filteredTransactionIds && (
              <div className="bg-terminal-900/30 border border-terminal-400/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-terminal-400 animate-pulse-slow" />
                    <p className="text-terminal-300 text-sm font-mono">
                      <span className="text-text-primary font-semibold">{getDisplayedTransactions().length}</span>
                      {' '}transactions filtered from pattern analysis
                    </p>
                  </div>
                  <button
                    onClick={handleClearFilter}
                    className="flex items-center space-x-1 text-text-secondary hover:text-terminal-300
                             text-sm font-medium transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear filter</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {response.error ? (
              <div className="bg-risk-critical-bg border border-risk-critical-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-risk-critical-text" />
                  <p className="text-risk-critical-text font-medium">
                    System Error: {response.error}
                  </p>
                </div>
              </div>
            ) : (
              <DataTable data={getDisplayedTransactions()} />
            )}
          </div>
        )}
        </div>
      )}

      {/* Footer Status Bar */}
      <footer className="flex items-center justify-center space-x-6 py-4 text-xs text-text-tertiary font-mono uppercase tracking-wider">
        <div className="flex items-center space-x-2">
          <div className="h-1.5 w-1.5 rounded-full bg-status-success-glow" />
          <span>Stripe</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-1.5 w-1.5 rounded-full bg-status-success-glow" />
          <span>PayPal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-1.5 w-1.5 rounded-full bg-status-success-glow" />
          <span>Adyen</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-1.5 w-1.5 rounded-full bg-terminal-400 animate-pulse-slow" />
          <span>AI Analysis</span>
        </div>
      </footer>
    </div>
  )
}
