'use client'

import { useState } from 'react'
import { Search, Loader2, Zap, BarChart3, Terminal, ChevronDown } from 'lucide-react'

interface QueryInterfaceProps {
  onQuery: (query: string, processor: 'stripe' | 'paypal' | 'adyen' | 'all', useRealStripe?: boolean) => void
  loading: boolean
}

export default function QueryInterface({ onQuery, loading }: QueryInterfaceProps) {
  const [query, setQuery] = useState('')
  const [processor, setProcessor] = useState<'stripe' | 'paypal' | 'adyen' | 'all'>('all')
  const [useRealStripe, setUseRealStripe] = useState(false)
  const [examplesExpanded, setExamplesExpanded] = useState(false)

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
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-terminal-400" />
              <span className="text-terminal-400 text-sm font-mono">&gt;</span>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter query for fraud analysis..."
              className="w-full pl-14 pr-4 py-3.5 bg-space-700 border border-border rounded-lg
                       text-text-primary placeholder-text-tertiary font-mono text-sm
                       shadow-terminal-input
                       focus:border-terminal-400 focus:ring-2 focus:ring-terminal-400/30 focus:shadow-glow
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
              disabled={loading}
            />
            {/* Subtle glow effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-terminal-300/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          </div>

          {/* Processor Toggle */}
          <div className="flex bg-space-800 border border-border rounded-lg p-1 shadow-terminal-input">
            {(['all', 'stripe', 'paypal', 'adyen'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setProcessor(value)}
                disabled={loading}
                className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                          ${processor === value
                            ? 'bg-terminal-500 text-white shadow-glow'
                            : 'text-text-secondary hover:text-text-primary hover:bg-space-700'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {value === 'all' ? 'All' : value === 'stripe' ? 'Stripe' : value === 'paypal' ? 'PayPal' : 'Adyen'}
              </button>
            ))}
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Stripe MCP Toggle */}
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={useRealStripe}
                onChange={(e) => setUseRealStripe(e.target.checked)}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-10 h-5 bg-space-600 rounded-full
                            peer-checked:bg-terminal-600 peer-focus:ring-2 peer-focus:ring-terminal-400/30
                            transition-colors duration-200" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-text-tertiary rounded-full
                            peer-checked:translate-x-5 peer-checked:bg-terminal-300
                            transition-all duration-200 shadow" />
            </div>
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              Use Stripe MCP
              <span className="text-text-tertiary ml-1">(requires API key)</span>
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="sm:w-auto w-full px-6 py-3 bg-terminal-500 hover:bg-terminal-600 active:bg-terminal-700
                     text-white font-semibold rounded-lg
                     shadow-glow hover:shadow-glow-lg
                     disabled:bg-space-600 disabled:text-text-tertiary disabled:shadow-none disabled:cursor-not-allowed
                     transition-all duration-300
                     flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-mono text-sm">ANALYZING...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="font-mono text-sm">EXECUTE QUERY</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Queries Accordion */}
      <div className="pt-2">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setExamplesExpanded(!examplesExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg
                   bg-space-700/30 border border-border/50 hover:border-border
                   hover:bg-space-700/50 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-risk-critical-text/70" />
              <BarChart3 className="h-4 w-4 text-terminal-300/70" />
            </div>
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              Example Queries
            </span>
            <span className="text-xs text-text-tertiary">
              {fraudDetectionQueries.length + generalQueries.length} templates
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-text-tertiary group-hover:text-text-secondary transition-all duration-300
                       ${examplesExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Accordion Content */}
        <div className={`accordion-content ${examplesExpanded ? 'expanded' : ''}`}>
          <div className="accordion-inner">
            <div className="space-y-4 pt-4">
              {/* Fraud Detection Queries */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-risk-critical-text" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-risk-critical-text">
                    Fraud Detection
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fraudDetectionQueries.map((example, index) => (
                    <button
                      key={`fraud-${index}`}
                      onClick={() => !loading && setQuery(example)}
                      className="text-left text-sm px-3 py-2.5 rounded-lg
                               bg-risk-critical-bg/50 border border-risk-critical-border/50
                               text-risk-critical-text/80 hover:text-risk-critical-text
                               hover:bg-risk-critical-bg hover:border-risk-critical-border
                               hover:shadow-glow-critical/30
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200"
                      disabled={loading}
                    >
                      <span className="line-clamp-1">{example}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* General Analysis Queries */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-terminal-300" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-terminal-300">
                    General Analysis
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {generalQueries.map((example, index) => (
                    <button
                      key={`general-${index}`}
                      onClick={() => !loading && setQuery(example)}
                      className="text-left text-sm px-3 py-2.5 rounded-lg
                               bg-space-700/50 border border-border/50
                               text-text-secondary hover:text-terminal-300
                               hover:bg-space-700 hover:border-terminal-400/30
                               hover:shadow-glow-sm
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200"
                      disabled={loading}
                    >
                      <span className="line-clamp-1">{example}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
