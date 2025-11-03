'use client'

import { useState } from 'react'
import { Search, Database } from 'lucide-react'
import QueryInterface from '@/components/QueryInterface'
import DataTable from '@/components/DataTable'
import FraudPatterns from '@/components/FraudPatterns'
import { QueryResponse } from '@/types'

export default function Home() {
  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [filteredTransactionIds, setFilteredTransactionIds] = useState<string[] | null>(null)

  const handleQuery = async (query: string, processor: 'stripe' | 'paypal' | 'all' = 'all', useRealStripe = false) => {
    setLoading(true)
    setFilteredTransactionIds(null) // Clear any existing filter
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

  const handleFilterTransactions = (transactionIds: string[]) => {
    setFilteredTransactionIds(transactionIds)
    // Scroll to the data table after filtering
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Fraud Explorer</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unified transaction analysis across payment processors. 
          Ask questions about your transaction data in natural language.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <QueryInterface onQuery={handleQuery} loading={loading} />
        
        {response && (
          <div className="space-y-6">
            {response.summary && (
              <div className={`border rounded-lg p-4 ${
                response.summary.includes('🚨') 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={response.summary.includes('🚨') ? 'text-red-800' : 'text-blue-800'}>
                  {response.summary}
                </p>
              </div>
            )}
            
            {response.fraud_patterns && response.fraud_patterns.length > 0 && (
              <FraudPatterns 
                patterns={response.fraud_patterns} 
                onFilterTransactions={handleFilterTransactions}
              />
            )}
            
            {filteredTransactionIds && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-blue-800">
                    Showing {getDisplayedTransactions().length} transactions from fraud pattern analysis
                  </p>
                  <button
                    onClick={handleClearFilter}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                  >
                    Show all transactions
                  </button>
                </div>
              </div>
            )}
            
            {response.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error: {response.error}</p>
              </div>
            ) : (
              <DataTable data={getDisplayedTransactions()} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}