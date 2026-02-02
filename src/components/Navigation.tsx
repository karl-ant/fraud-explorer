'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Wand2, BarChart3, Radar, Database } from 'lucide-react'
import { useTransactions } from '@/context/TransactionContext'

export default function Navigation() {
  const pathname = usePathname()
  const { hasGeneratedData, transactions } = useTransactions()

  const tabs = [
    {
      href: '/',
      label: 'Query',
      icon: Search
    },
    {
      href: '/generator',
      label: 'Generator',
      icon: Wand2
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3
    }
  ]

  return (
    <nav className="mb-6">
      {/* App Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Radar className="h-10 w-10 text-terminal-300 animate-pulse-slow" />
            <div className="absolute inset-0 h-10 w-10 bg-terminal-300/20 rounded-full blur-xl animate-glow-breathe" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-wider text-text-primary text-shadow-glow">
              Fraud Explorer
            </h1>
            <p className="text-xs text-text-tertiary font-mono uppercase tracking-wider">
              Mission Control
            </p>
          </div>
        </div>

        {/* Data Indicator */}
        {hasGeneratedData && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-terminal-900/30 border border-terminal-400/30 rounded-lg">
            <Database className="h-4 w-4 text-terminal-400" />
            <span className="text-xs font-mono text-terminal-300">
              {transactions.length.toLocaleString()} transactions loaded
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-space-800 border border-border rounded-lg p-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md
                font-medium text-sm transition-all duration-200
                ${isActive
                  ? 'bg-terminal-500 text-white shadow-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-space-700'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
