'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, AlertTriangle, Filter, X } from 'lucide-react'
import QueryInterface from '@/components/QueryInterface'
import DataTable from '@/components/DataTable'
import FraudPatterns from '@/components/FraudPatterns'
import { ThemeToggle } from '@/components/ThemeToggle'
import { QueryResponse } from '@/types'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function Home() {
  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [filteredTransactionIds, setFilteredTransactionIds] = useState<string[] | null>(null)

  const handleQuery = async (query: string, processor: 'stripe' | 'paypal' | 'all' = 'all', useRealStripe = false) => {
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

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.header variants={fadeUp} className="relative">
        {/* Theme Toggle - Absolute positioned */}
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>

        <div className="text-center space-y-4 pt-2">
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="p-3 rounded-elegant bg-accent/10 border border-accent/20"
            >
              <Database className="h-8 w-8 text-accent" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-primary tracking-tight">
              Fraud Explorer
            </h1>
          </div>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Unified transaction analysis across payment processors.
            Ask questions about your transaction data in natural language.
          </p>
        </div>
      </motion.header>

      {/* Main Card */}
      <motion.div
        variants={fadeUp}
        className="card-elegant p-8 space-y-8"
      >
        <QueryInterface onQuery={handleQuery} loading={loading} />

        <AnimatePresence mode="wait">
          {response && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Summary Alert */}
              {response.summary && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`
                    rounded-elegant p-5 border-l-4
                    ${response.summary.includes('🚨')
                      ? 'bg-danger-muted border-danger'
                      : 'bg-accent-muted border-accent'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {response.summary.includes('🚨') && (
                      <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`
                      text-sm leading-relaxed
                      ${response.summary.includes('🚨') ? 'text-danger' : 'text-text-primary'}
                    `}>
                      {response.summary}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Fraud Patterns */}
              {response.fraud_patterns && response.fraud_patterns.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <FraudPatterns
                    patterns={response.fraud_patterns}
                    onFilterTransactions={handleFilterTransactions}
                  />
                </motion.div>
              )}

              {/* Filter Status Bar */}
              {filteredTransactionIds && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-accent-muted border border-accent/20 rounded-elegant p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-primary">
                      <Filter className="h-4 w-4 text-accent" />
                      <span className="text-sm">
                        Showing <strong className="text-accent">{getDisplayedTransactions().length}</strong> filtered transactions
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearFilter}
                      className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Clear filter
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Error or Data Table */}
              {response.error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-danger-muted border border-danger/20 rounded-elegant p-5"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                    <p className="text-danger text-sm">Error: {response.error}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <DataTable data={getDisplayedTransactions()} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
