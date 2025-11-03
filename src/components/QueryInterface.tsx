'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface QueryInterfaceProps {
  onQuery: (query: string, processor: 'stripe' | 'paypal' | 'all', useRealStripe?: boolean) => void
  loading: boolean
}

export default function QueryInterface({ onQuery, loading }: QueryInterfaceProps) {
  const [query, setQuery] = useState('')
  const [processor, setProcessor] = useState<'stripe' | 'paypal' | 'all'>('all')
  const [useRealStripe, setUseRealStripe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !loading) {
      onQuery(query.trim(), processor, useRealStripe)
    }
  }

  const fraudDetectionQueries = [
    "Show me all suspicious transaction patterns from today",
    "Analyze card testing attacks from the last hour", 
    "Find high-risk international transactions over $5000",
    "Detect cryptocurrency fraud patterns",
    "Show velocity fraud attempts in PayPal",
    "Find round-number fraud patterns",
    "Analyze off-hours transactions from high-risk countries",
    "Show retry attack patterns and card cracking attempts"
  ]

  const generalQueries = [
    "Show me all failed transactions from the last 30 days",
    "Analyze successful vs failed transactions this month", 
    "List all transactions between $100-$1000",
    "Show transactions with high risk scores"
  ]

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about transaction patterns and fraud detection..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              disabled={loading}
            />
          </div>
          
          <select
            value={processor}
            onChange={(e) => setProcessor(e.target.value as 'stripe' | 'paypal' | 'all')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="all">All Processors</option>
            <option value="stripe">Stripe Only</option>
            <option value="paypal">PayPal Only</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useRealStripe"
            checked={useRealStripe}
            onChange={(e) => setUseRealStripe(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={loading}
          />
          <label htmlFor="useRealStripe" className="text-sm text-gray-700">
            Use Stripe MCP server (requires Stripe API key)
          </label>
        </div>
        
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing query...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Analyze Transactions</span>
            </>
          )}
        </button>
      </form>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-red-600 font-medium mb-2">🚨 Fraud Detection Example Queries:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fraudDetectionQueries.map((example, index) => (
              <button
                key={`fraud-${index}`}
                onClick={() => !loading && setQuery(example)}
                className="text-left text-sm text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded border border-red-200 hover:border-red-300 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 font-medium mb-2">📊 General Analysis Example Queries:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {generalQueries.map((example, index) => (
              <button
                key={`general-${index}`}
                onClick={() => !loading && setQuery(example)}
                className="text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded border border-gray-200 hover:border-blue-300 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}