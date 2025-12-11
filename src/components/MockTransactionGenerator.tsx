'use client'

import { useState } from 'react'
import { Wand2, Loader2, AlertTriangle } from 'lucide-react'
import { GeneratorConfig, MockTransactionGenerator } from '@/lib/mock-generator'
import { TransactionData } from '@/types'

interface MockTransactionGeneratorProps {
  onTransactionsGenerated: (transactions: TransactionData[]) => void
}

export default function MockTransactionGeneratorComponent({ onTransactionsGenerated }: MockTransactionGeneratorProps) {
  const [config, setConfig] = useState<GeneratorConfig>({
    count: 100,
    processor: 'paypal',
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    fraudMix: {
      cardTesting: 10,
      velocityFraud: 10,
      highRiskCountry: 5,
      roundNumber: 5,
      retryAttack: 10,
      cryptoFraud: 5,
      nightTime: 5,
      highValue: 5,
      legitimate: 45
    },
    statusDistribution: {
      succeeded: 70,
      failed: 20,
      pending: 8,
      canceled: 2
    }
  })

  const [generating, setGenerating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Compute validation state
  const fraudTotal = Object.values(config.fraudMix).reduce((a, b) => a + b, 0)
  const statusTotal = Object.values(config.statusDistribution).reduce((a, b) => a + b, 0)
  const isValidFraudMix = Math.abs(fraudTotal - 100) < 0.1
  const isValidStatusDist = Math.abs(statusTotal - 100) < 0.1
  const isValidCount = config.count >= 1 && config.count <= 10000
  const isValidDateRange = config.dateRange.start < config.dateRange.end

  const handleGenerate = () => {
    // Validate before generation
    if (!isValidCount) {
      setValidationError('Transaction count must be between 1 and 10,000')
      return
    }
    if (!isValidFraudMix) {
      setValidationError(`Fraud mix must sum to 100% (currently ${fraudTotal}%)`)
      return
    }
    if (!isValidStatusDist) {
      setValidationError(`Status distribution must sum to 100% (currently ${statusTotal}%)`)
      return
    }
    if (!isValidDateRange) {
      setValidationError('Start date must be before end date')
      return
    }

    setValidationError(null)
    setGenerating(true)

    // Use requestAnimationFrame to ensure UI updates before heavy computation
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const generator = new MockTransactionGenerator(config)
          const transactions = generator.generate()
          onTransactionsGenerated(transactions)
        } catch (error) {
          setValidationError(error instanceof Error ? error.message : 'Generation failed')
        } finally {
          setGenerating(false)
        }
      }, 50)
    })
  }

  return (
    <div className="panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Wand2 className="h-6 w-6 text-terminal-300" />
        <h3 className="text-lg font-display font-semibold uppercase tracking-wider text-text-primary">
          Mock Transaction Generator
        </h3>
      </div>

      {/* Count and Processor Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Count Input */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 block">
            Transaction Count
          </label>
          <input
            type="number"
            value={config.count}
            onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-space-700 border border-border rounded-lg
                     text-text-primary font-mono text-sm
                     focus:border-terminal-400 focus:ring-2 focus:ring-terminal-400/30
                     transition-all"
            min="1"
            max="10000"
          />
        </div>

        {/* Processor Selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 block">
            Processor
          </label>
          <div className="flex space-x-2">
            {(['stripe', 'paypal', 'adyen'] as const).map((proc) => (
              <button
                key={proc}
                onClick={() => setConfig({ ...config, processor: proc })}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all
                          ${config.processor === proc
                            ? 'bg-terminal-500 text-white shadow-glow'
                            : 'bg-space-700 text-text-secondary hover:text-text-primary'
                          }`}
              >
                {proc.charAt(0).toUpperCase() + proc.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 block">
            Start Date
          </label>
          <input
            type="date"
            value={config.dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => setConfig({
              ...config,
              dateRange: { ...config.dateRange, start: new Date(e.target.value) }
            })}
            className="w-full px-4 py-3 bg-space-700 border border-border rounded-lg
                     text-text-primary font-mono text-sm
                     focus:border-terminal-400 focus:ring-2 focus:ring-terminal-400/30
                     transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 block">
            End Date
          </label>
          <input
            type="date"
            value={config.dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => setConfig({
              ...config,
              dateRange: { ...config.dateRange, end: new Date(e.target.value) }
            })}
            className="w-full px-4 py-3 bg-space-700 border border-border rounded-lg
                     text-text-primary font-mono text-sm
                     focus:border-terminal-400 focus:ring-2 focus:ring-terminal-400/30
                     transition-all"
          />
        </div>
      </div>

      {/* Fraud Mix Sliders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Fraud Pattern Mix (%)
          </label>
          <span className={`text-xs font-mono ${isValidFraudMix ? 'text-status-success-glow' : 'text-risk-critical-text'}`}>
            Total: {fraudTotal}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          {Object.entries(config.fraudMix).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-terminal-300 font-mono">{value}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setConfig({
                  ...config,
                  fraudMix: { ...config.fraudMix, [key]: parseInt(e.target.value) }
                })}
                className="w-full h-3 bg-space-600 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-terminal-400
                         [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Status Distribution (%)
          </label>
          <span className={`text-xs font-mono ${isValidStatusDist ? 'text-status-success-glow' : 'text-risk-critical-text'}`}>
            Total: {statusTotal}%
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {Object.entries(config.statusDistribution).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary capitalize">{key}</span>
                <span className="text-sm text-terminal-300 font-mono">{value}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setConfig({
                  ...config,
                  statusDistribution: { ...config.statusDistribution, [key]: parseInt(e.target.value) }
                })}
                className="w-full h-3 bg-space-600 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-terminal-400
                         [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center space-x-2 p-3 bg-risk-critical-bg/50 border border-risk-critical-border rounded-lg">
          <AlertTriangle className="h-4 w-4 text-risk-critical-text flex-shrink-0" />
          <span className="text-sm text-risk-critical-text">{validationError}</span>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || !isValidFraudMix || !isValidStatusDist || !isValidCount || !isValidDateRange}
        className="w-full px-6 py-3 bg-terminal-500 hover:bg-terminal-600
                 text-white font-semibold rounded-lg
                 shadow-glow hover:shadow-glow-lg
                 disabled:bg-space-600 disabled:text-text-tertiary disabled:shadow-none
                 transition-all duration-300
                 flex items-center justify-center space-x-2"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>GENERATING...</span>
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            <span>GENERATE TRANSACTIONS</span>
          </>
        )}
      </button>
    </div>
  )
}
