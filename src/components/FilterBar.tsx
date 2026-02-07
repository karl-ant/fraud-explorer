'use client'

import { X, Search } from 'lucide-react'
import { TransactionData } from '@/types'

export interface ActiveFilters {
  statuses: string[]
  processors: string[]
  amountMin: string
  amountMax: string
  searchQuery: string
}

export const EMPTY_FILTERS: ActiveFilters = {
  statuses: [],
  processors: [],
  amountMin: '',
  amountMax: '',
  searchQuery: '',
}

interface FilterBarProps {
  filters: ActiveFilters
  onChange: (filters: ActiveFilters) => void
}

const STATUS_OPTIONS = ['succeeded', 'failed', 'pending', 'canceled'] as const
const PROCESSOR_OPTIONS = ['stripe', 'paypal', 'adyen'] as const

export function applyClientFilters(data: TransactionData[], filters: ActiveFilters): TransactionData[] {
  let result = data

  if (filters.statuses.length > 0) {
    result = result.filter(t => filters.statuses.includes(t.status))
  }

  if (filters.processors.length > 0) {
    result = result.filter(t => t.processor && filters.processors.includes(t.processor))
  }

  if (filters.amountMin) {
    const min = parseFloat(filters.amountMin) * 100
    if (!isNaN(min)) result = result.filter(t => t.amount >= min)
  }

  if (filters.amountMax) {
    const max = parseFloat(filters.amountMax) * 100
    if (!isNaN(max)) result = result.filter(t => t.amount <= max)
  }

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase()
    result = result.filter(t =>
      t.id.toLowerCase().includes(q) ||
      (t.customer && t.customer.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    )
  }

  return result
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const activeCount =
    filters.statuses.length +
    filters.processors.length +
    (filters.amountMin ? 1 : 0) +
    (filters.amountMax ? 1 : 0) +
    (filters.searchQuery ? 1 : 0)

  const toggleStatus = (status: string) => {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status]
    onChange({ ...filters, statuses })
  }

  const toggleProcessor = (processor: string) => {
    const processors = filters.processors.includes(processor)
      ? filters.processors.filter(p => p !== processor)
      : [...filters.processors, processor]
    onChange({ ...filters, processors })
  }

  const statusColorMap: Record<string, string> = {
    succeeded: 'bg-status-success-bg border-status-success-border text-status-success-text',
    failed: 'bg-status-failed-bg border-status-failed-border text-status-failed-text',
    pending: 'bg-status-pending-bg border-status-pending-border text-status-pending-text',
    canceled: 'bg-status-canceled-bg border-status-canceled-border text-status-canceled-text',
  }

  const processorColorMap: Record<string, string> = {
    stripe: 'bg-terminal-900/50 border-terminal-500/30 text-terminal-300',
    paypal: 'bg-blue-900/20 border-blue-500/30 text-blue-300',
    adyen: 'bg-purple-900/20 border-purple-500/30 text-purple-300',
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-space-800 border border-border rounded-lg">
      {/* Search Input */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex items-center">
          <Search className="absolute left-2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, customer, description…"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-56 pl-7 pr-7 py-1 bg-space-700 border border-border rounded text-xs font-mono text-text-primary placeholder-text-tertiary focus:border-terminal-400 focus:outline-none"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-1.5 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Status Toggles */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-tertiary font-mono uppercase tracking-wider mr-1">Status</span>
        {STATUS_OPTIONS.map(status => {
          const active = filters.statuses.includes(status)
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-2 py-1 rounded border text-xs font-medium uppercase transition-all duration-150
                ${active
                  ? statusColorMap[status]
                  : 'bg-space-700 border-border text-text-tertiary hover:text-text-secondary hover:border-border-emphasis'
                }`}
            >
              {status}
            </button>
          )
        })}
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Processor Toggles */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-tertiary font-mono uppercase tracking-wider mr-1">Processor</span>
        {PROCESSOR_OPTIONS.map(proc => {
          const active = filters.processors.includes(proc)
          return (
            <button
              key={proc}
              onClick={() => toggleProcessor(proc)}
              className={`px-2 py-1 rounded border text-xs font-medium uppercase transition-all duration-150
                ${active
                  ? processorColorMap[proc]
                  : 'bg-space-700 border-border text-text-tertiary hover:text-text-secondary hover:border-border-emphasis'
                }`}
            >
              {proc}
            </button>
          )
        })}
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Amount Range */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-tertiary font-mono uppercase tracking-wider mr-1">Amount</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-tertiary">$</span>
          <input
            type="number"
            placeholder="Min"
            value={filters.amountMin}
            onChange={(e) => onChange({ ...filters, amountMin: e.target.value })}
            className="w-20 px-2 py-1 bg-space-700 border border-border rounded text-xs font-mono text-text-primary placeholder-text-tertiary focus:border-terminal-400 focus:outline-none"
          />
        </div>
        <span className="text-xs text-text-tertiary">–</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-tertiary">$</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.amountMax}
            onChange={(e) => onChange({ ...filters, amountMax: e.target.value })}
            className="w-20 px-2 py-1 bg-space-700 border border-border rounded text-xs font-mono text-text-primary placeholder-text-tertiary focus:border-terminal-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Active Count + Clear */}
      {activeCount > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-terminal-900/50 border border-terminal-400/30 rounded text-xs font-mono text-terminal-300">
              {activeCount} active
            </span>
            <button
              onClick={() => onChange(EMPTY_FILTERS)}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-terminal-300 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Clear all</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
