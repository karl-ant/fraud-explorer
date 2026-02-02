'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Wand2, BarChart3, Database, ChevronDown } from 'lucide-react'
import { useTransactions } from '@/context/TransactionContext'
import { useTheme, THEME_CONFIGS } from '@/context/ThemeContext'

export default function Navigation() {
  const pathname = usePathname()
  const { hasGeneratedData, transactions } = useTransactions()
  const { theme, setTheme, config } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const tabs = [
    { href: '/', label: 'Query', icon: Search },
    { href: '/generator', label: 'Generator', icon: Wand2 },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  const ThemeIcon = config.icon

  return (
    <nav className="mb-6">
      {/* App Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <ThemeIcon className="h-10 w-10 text-terminal-300 animate-pulse-slow" />
            <div className="absolute inset-0 h-10 w-10 bg-terminal-300/20 rounded-full blur-xl animate-glow-breathe" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-wider text-text-primary text-shadow-glow">
              Fraud Explorer
            </h1>
            <p className="text-xs text-text-tertiary font-mono uppercase tracking-wider">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-space-700 border border-border rounded-lg hover:border-terminal-400/50 transition-all duration-200"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.accent }}
              />
              <span className="text-xs font-medium text-text-secondary">{config.label}</span>
              <ChevronDown className={`h-3 w-3 text-text-tertiary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-space-800 border border-border rounded-lg shadow-panel-lg z-50 overflow-hidden animate-fade-in">
                {THEME_CONFIGS.map((t) => {
                  const Icon = t.icon
                  const isActive = theme === t.value
                  return (
                    <button
                      key={t.value}
                      onClick={() => {
                        setTheme(t.value)
                        setDropdownOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 text-left transition-colors duration-150
                        ${isActive
                          ? 'bg-terminal-500/15 text-text-primary'
                          : 'text-text-secondary hover:bg-space-700 hover:text-text-primary'
                        }
                      `}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.accent }}
                      />
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
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
