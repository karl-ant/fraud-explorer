'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'
import MockTransactionGenerator from '@/components/MockTransactionGenerator'
import { useTransactions } from '@/context/TransactionContext'
import { TransactionData } from '@/types'

export default function GeneratorPage() {
  const router = useRouter()
  const { setGeneratedTransactions, hasGeneratedData, transactions } = useTransactions()
  const [justGenerated, setJustGenerated] = useState(false)

  const handleTransactionsGenerated = (newTransactions: TransactionData[]) => {
    setGeneratedTransactions(newTransactions)
    setJustGenerated(true)
    setTimeout(() => setJustGenerated(false), 5000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="text-center space-y-2 py-4">
        <p className="text-text-secondary max-w-2xl mx-auto">
          Generate mock transaction data with configurable fraud patterns for testing and analysis.
        </p>
      </header>

      {/* Generator Component */}
      <MockTransactionGenerator onTransactionsGenerated={handleTransactionsGenerated} />

      {/* Success Banner with Navigation */}
      {hasGeneratedData && (
        <div className={`
          panel p-4 border-2 transition-all duration-500
          ${justGenerated
            ? 'border-status-success-glow bg-status-success-bg/30'
            : 'border-terminal-400/50 bg-terminal-900/20'
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className={`h-5 w-5 ${justGenerated ? 'text-status-success-glow' : 'text-terminal-400'}`} />
              <div>
                <p className={`font-medium ${justGenerated ? 'text-status-success-text' : 'text-text-primary'}`}>
                  {transactions.length.toLocaleString()} transactions ready
                </p>
                <p className="text-xs text-text-secondary">
                  Data will persist when you navigate to the Query page
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-terminal-500 hover:bg-terminal-600
                       text-white font-medium rounded-lg shadow-glow hover:shadow-glow-lg
                       transition-all duration-300"
            >
              <span>View in Query</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4">
        <p className="text-xs text-text-tertiary font-mono">
          Generated data is stored in memory and will be cleared on page refresh
        </p>
      </footer>
    </div>
  )
}
