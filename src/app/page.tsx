'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, X, Database } from 'lucide-react'
import QueryInterface from '@/components/QueryInterface'
import DataTable from '@/components/DataTable'
import FraudPatterns from '@/components/FraudPatterns'
import FilterBar, { ActiveFilters, EMPTY_FILTERS, applyClientFilters } from '@/components/FilterBar'
import TransactionDrawer from '@/components/TransactionDrawer'
import { useTransactions } from '@/context/TransactionContext'
import { QueryResponse, TransactionData } from '@/types'

export default function Home() {
  const { transactions: contextTransactions, fraudPatterns: contextFraudPatterns, hasGeneratedData } = useTransactions()

  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [filteredTransactionIds, setFilteredTransactionIds] = useState<string[] | null>(null)
  const [showingGeneratedData, setShowingGeneratedData] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null)

  // Auto-display generated data when available and no API query has been made
  useEffect(() => {
    // Only auto-display if: we have data, no response loaded, not loading, and not already showing generated data
    if (hasGeneratedData && !response && !loading && !showingGeneratedData) {
      setResponse({
        data: contextTransactions,
        summary: `Displaying ${contextTransactions.length.toLocaleString()} generated mock transactions with ${contextFraudPatterns.length} fraud patterns detected`,
        fraud_patterns: contextFraudPatterns
      })
      setShowingGeneratedData(true)
    }
  }, [hasGeneratedData, contextTransactions, contextFraudPatterns, response, loading, showingGeneratedData])

  const handleQuery = async (query: string, processor: 'stripe' | 'paypal' | 'adyen' | 'all' = 'all', useRealStripe = false) => {
    setLoading(true)
    setFilteredTransactionIds(null)
    setShowingGeneratedData(false)
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

  const handleShowGeneratedData = () => {
    if (hasGeneratedData) {
      setResponse({
        data: contextTransactions,
        summary: `Displaying ${contextTransactions.length.toLocaleString()} generated mock transactions with ${contextFraudPatterns.length} fraud patterns detected`,
        fraud_patterns: contextFraudPatterns
      })
      setShowingGeneratedData(true)
      setFilteredTransactionIds(null)
    }
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
    let data = response.data
    if (filteredTransactionIds) {
      data = data.filter(t => filteredTransactionIds.includes(t.id))
    }
    return applyClientFilters(data, activeFilters)
  }

  const hasAlerts = response?.summary?.includes('🚨') || (response?.fraud_patterns && response.fraud_patterns.length > 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Control Panel */}
      <div className="panel p-6 space-y-6">
        <QueryInterface onQuery={handleQuery} loading={loading} />

        {/* Generated Data Quick Access */}
        {hasGeneratedData && !showingGeneratedData && (
          <div className="flex items-center justify-between p-3 bg-terminal-900/30 border border-terminal-400/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-terminal-400" />
              <span className="text-sm text-text-secondary">
                <span className="text-terminal-300 font-medium">{contextTransactions.length.toLocaleString()}</span> generated transactions available
              </span>
            </div>
            <button
              onClick={handleShowGeneratedData}
              className="text-sm text-terminal-300 hover:text-terminal-200 font-medium transition-colors"
            >
              Show generated data
            </button>
          </div>
        )}
      </div>

      {/* Results Panel */}
      {response && (
        <div className="panel p-6 space-y-6">
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

            {/* Client-Side Filters */}
            {!response.error && response.data.length > 0 && (
              <FilterBar filters={activeFilters} onChange={setActiveFilters} />
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
              <DataTable
                data={getDisplayedTransactions()}
                onSelectTransaction={setSelectedTransaction}
              />
            )}
          </div>
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

      {/* Transaction Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTransaction}
        fraudPatterns={response?.fraud_patterns || []}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  )
}
