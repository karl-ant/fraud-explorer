'use client'

import { useState } from 'react'
import { Wand2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [showConfig, setShowConfig] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)

    setTimeout(() => {
      const generator = new MockTransactionGenerator(config)
      const transactions = generator.generate()
      onTransactionsGenerated(transactions)
      setGenerating(false)
    }, 500)
  }

  return (
    <div className="panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wand2 className="h-5 w-5 text-terminal-300" />
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary">
            Mock Transaction Generator
          </h3>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-1 text-xs text-terminal-300 hover:text-terminal-200 transition-colors"
        >
          <span>{showConfig ? 'Hide Config' : 'Show Config'}</span>
          {showConfig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {showConfig && (
        <div className="space-y-4 animate-fade-in">
          {/* Count and Processor Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Count Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 block">
                Transaction Count
              </label>
              <input
                type="number"
                value={config.count}
                onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-space-700 border border-border rounded-lg
                         text-text-primary font-mono text-sm
                         focus:border-terminal-400 focus:ring-2 focus:ring-terminal-400/30
                         transition-all"
                min="1"
                max="1000"
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
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all
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
          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-3 py-2 bg-space-700 border border-border rounded-lg
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
                className="w-full px-3 py-2 bg-space-700 border border-border rounded-lg
                         text-text-primary font-mono text-sm
                         focus:border-terminal-400 focus:ring-2 focus:ring-terminal-400/30
                         transition-all"
              />
            </div>
          </div>

          {/* Fraud Mix Sliders */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3 block">
              Fraud Pattern Mix (%)
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Object.entries(config.fraudMix).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-text-secondary capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-xs text-terminal-300 font-mono">{value}%</span>
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
                    className="w-full h-2 bg-space-600 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-4
                             [&::-webkit-slider-thumb]:h-4
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
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3 block">
              Status Distribution (%)
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Object.entries(config.statusDistribution).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-text-secondary capitalize">{key}</span>
                    <span className="text-xs text-terminal-300 font-mono">{value}%</span>
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
                    className="w-full h-2 bg-space-600 rounded-lg appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-4
                             [&::-webkit-slider-thumb]:h-4
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-terminal-400
                             [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
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
