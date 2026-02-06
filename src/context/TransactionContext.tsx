'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { TransactionData, FraudPattern } from '@/types'
import { FraudDetector } from '@/lib/fraud-detector'

const STORAGE_KEY = 'fraud-explorer-transactions'

interface TransactionContextType {
  transactions: TransactionData[]
  fraudPatterns: FraudPattern[]
  setGeneratedTransactions: (transactions: TransactionData[]) => void
  setTransactionsWithPatterns: (transactions: TransactionData[], patterns: FraudPattern[]) => void
  clearTransactions: () => void
  hasGeneratedData: boolean
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [fraudPatterns, setFraudPatterns] = useState<FraudPattern[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.transactions?.length > 0) {
          setTransactions(parsed.transactions)
          const patterns = FraudDetector.analyzeFraudPatterns(parsed.transactions)
          setFraudPatterns(patterns)
        }
      }
    } catch (error) {
      console.error('Failed to load transactions from sessionStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save to sessionStorage when transactions change (after hydration)
  useEffect(() => {
    if (!isHydrated) return

    try {
      if (transactions.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions }))
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to save transactions to sessionStorage:', error)
    }
  }, [transactions, isHydrated])

  const setGeneratedTransactions = useCallback((newTransactions: TransactionData[]) => {
    setTransactions(newTransactions)
    const patterns = FraudDetector.analyzeFraudPatterns(newTransactions)
    setFraudPatterns(patterns)
  }, [])

  const setTransactionsWithPatterns = useCallback((newTransactions: TransactionData[], patterns: FraudPattern[]) => {
    setTransactions(newTransactions)
    setFraudPatterns(patterns)
  }, [])

  const clearTransactions = useCallback(() => {
    setTransactions([])
    setFraudPatterns([])
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error)
    }
  }, [])

  return (
    <TransactionContext.Provider value={{
      transactions,
      fraudPatterns,
      setGeneratedTransactions,
      setTransactionsWithPatterns,
      clearTransactions,
      hasGeneratedData: transactions.length > 0
    }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
}
