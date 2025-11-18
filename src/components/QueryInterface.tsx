'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, AlertTriangle, BarChart3 } from 'lucide-react'

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

  const processors = [
    { value: 'all', label: 'All' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
  ] as const

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search Input Row */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about transaction patterns and fraud detection..."
              className="
                w-full pl-12 pr-4 py-4
                bg-bg-tertiary border border-border-primary rounded-elegant
                text-text-primary placeholder:text-text-tertiary
                focus:ring-2 focus:ring-accent/50 focus:border-accent
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={loading}
            />
          </div>

          {/* Processor Selector - Segmented Control */}
          <div className="flex items-center p-1 bg-bg-tertiary rounded-elegant border border-border-primary">
            {processors.map(({ value, label }) => (
              <motion.button
                key={value}
                type="button"
                onClick={() => setProcessor(value)}
                disabled={loading}
                className={`
                  relative px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  disabled:cursor-not-allowed
                  ${processor === value
                    ? 'text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                  }
                `}
                whileHover={{ scale: processor === value ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {processor === value && (
                  <motion.div
                    layoutId="processor-indicator"
                    className="absolute inset-0 bg-bg-secondary rounded-lg shadow-elegant-sm border border-border-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              id="useRealStripe"
              checked={useRealStripe}
              onChange={(e) => setUseRealStripe(e.target.checked)}
              className="
                peer h-5 w-5 rounded border-border-secondary
                text-accent focus:ring-accent/50 focus:ring-offset-0
                bg-bg-tertiary
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={loading}
            />
          </div>
          <label
            htmlFor="useRealStripe"
            className="text-sm text-text-secondary cursor-pointer select-none"
          >
            Use Stripe MCP server <span className="text-text-tertiary">(requires API key)</span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!query.trim() || loading}
          className="
            w-full py-4 px-6 rounded-elegant
            bg-gradient-to-r from-amber-500 to-yellow-500
            hover:from-amber-600 hover:to-yellow-600
            text-stone-900 font-semibold
            shadow-elegant hover:shadow-elegant-lg
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-elegant
            flex items-center justify-center gap-2
          "
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Analyze Transactions</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Example Queries */}
      <div className="space-y-6 pt-2">
        {/* Fraud Detection Queries */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <h3 className="text-sm font-medium text-text-primary">Fraud Detection</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fraudDetectionQueries.map((example, index) => (
              <motion.button
                key={`fraud-${index}`}
                onClick={() => !loading && setQuery(example)}
                disabled={loading}
                className="
                  text-left text-sm p-3 rounded-elegant
                  bg-danger-muted/50 hover:bg-danger-muted
                  border border-danger/10 hover:border-danger/20
                  text-text-secondary hover:text-danger
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                {example}
              </motion.button>
            ))}
          </div>
        </div>

        {/* General Analysis Queries */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-medium text-text-primary">General Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {generalQueries.map((example, index) => (
              <motion.button
                key={`general-${index}`}
                onClick={() => !loading && setQuery(example)}
                disabled={loading}
                className="
                  text-left text-sm p-3 rounded-elegant
                  bg-accent-muted/50 hover:bg-accent-muted
                  border border-accent/10 hover:border-accent/20
                  text-text-secondary hover:text-accent
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (fraudDetectionQueries.length + index) * 0.03 }}
              >
                {example}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
