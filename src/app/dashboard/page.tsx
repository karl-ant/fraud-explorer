'use client'

import { useMemo } from 'react'
import { BarChart3, DollarSign, Activity, ShieldAlert, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { useTransactions } from '@/context/TransactionContext'
import { useTheme } from '@/context/ThemeContext'
import StatCard from '@/components/charts/StatCard'
import DonutChart from '@/components/charts/DonutChart'
import BarChart from '@/components/charts/BarChart'
import {
  computeStatusDistribution,
  computeProcessorBreakdown,
  computeVolumeByDay,
  computeFraudSummary,
  computeOverviewStats,
} from '@/lib/analytics'

function getCSSVar(name: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function useChartColors() {
  const { theme } = useTheme()
  return useMemo(() => ({
    status: {
      succeeded: getCSSVar('--chart-success'),
      failed: getCSSVar('--chart-failed'),
      pending: getCSSVar('--chart-pending'),
      canceled: getCSSVar('--chart-canceled'),
    } as Record<string, string>,
    processor: {
      stripe: getCSSVar('--chart-stripe'),
      paypal: getCSSVar('--chart-paypal'),
      adyen: getCSSVar('--chart-adyen'),
      unknown: getCSSVar('--chart-unknown'),
    } as Record<string, string>,
    risk: {
      critical: getCSSVar('--chart-risk-critical'),
      high: getCSSVar('--chart-risk-high'),
      medium: getCSSVar('--chart-risk-medium'),
      low: getCSSVar('--chart-risk-low'),
    } as Record<string, string>,
    accent: getCSSVar('--chart-accent'),
  }), [theme])
}

export default function DashboardPage() {
  const { transactions, fraudPatterns, hasGeneratedData } = useTransactions()
  const colors = useChartColors()

  const stats = useMemo(() => computeOverviewStats(transactions, fraudPatterns), [transactions, fraudPatterns])
  const statusDist = useMemo(() => computeStatusDistribution(transactions), [transactions])
  const processorBreak = useMemo(() => computeProcessorBreakdown(transactions), [transactions])
  const volumeByDay = useMemo(() => computeVolumeByDay(transactions), [transactions])
  const fraudSummary = useMemo(() => computeFraudSummary(transactions, fraudPatterns), [transactions, fraudPatterns])

  if (!hasGeneratedData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
        <BarChart3 className="h-12 w-12 text-space-500" />
        <p className="text-text-secondary text-sm">No transaction data loaded.</p>
        <Link
          href="/generator"
          className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-500 hover:bg-terminal-600 text-white rounded-lg font-medium text-sm transition-colors shadow-glow"
        >
          <Wand2 className="h-4 w-4" />
          Generate Transactions
        </Link>
      </div>
    )
  }

  const formatDollar = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Transactions" value={stats.total.toLocaleString()} />
        <StatCard icon={DollarSign} label="Total Volume" value={formatDollar(stats.volume)} />
        <StatCard icon={ShieldAlert} label="Fraud Rate" value={`${stats.fraudRate.toFixed(1)}%`} sub={`${fraudPatterns.length} patterns`} />
        <StatCard icon={BarChart3} label="Avg Transaction" value={formatDollar(stats.avgAmount)} />
      </div>

      {/* Row 1: Donut charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DonutChart
          title="Status Distribution"
          segments={statusDist.map(s => ({
            label: s.status,
            value: s.count,
            color: colors.status[s.status] || colors.processor.unknown,
          }))}
        />
        <DonutChart
          title="Processor Breakdown"
          segments={processorBreak.map(p => ({
            label: p.processor,
            value: p.count,
            color: colors.processor[p.processor] || colors.processor.unknown,
          }))}
        />
      </div>

      {/* Row 2: Volume by day */}
      <BarChart
        title="Transaction Volume by Day"
        bars={volumeByDay.map(d => ({
          label: d.date.slice(5),
          value: d.count,
          color: colors.accent,
        }))}
      />

      {/* Row 3: Fraud patterns + risk summary */}
      {fraudSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BarChart
            title="Fraud Pattern Distribution"
            bars={fraudSummary.map(f => ({
              label: f.patternType.replace(/_/g, ' ').split(' ').map(w => w[0]?.toUpperCase()).join(''),
              value: f.count,
              color: colors.risk[f.riskLevel] || colors.processor.unknown,
            }))}
          />
          <div className="panel p-4 space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-tertiary">Risk Level Summary</h4>
            <div className="space-y-2">
              {fraudSummary.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-space-800 rounded border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.risk[f.riskLevel] || colors.processor.unknown }} />
                    <span className="text-sm text-text-secondary capitalize">{f.patternType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-text-primary">{f.count} txns</span>
                    <span className={`px-1.5 py-0.5 rounded border text-xs font-medium uppercase
                      ${f.riskLevel === 'critical' ? 'bg-risk-critical-bg border-risk-critical-border text-risk-critical-text'
                        : f.riskLevel === 'high' ? 'bg-risk-high-bg border-risk-high-border text-risk-high-text'
                        : f.riskLevel === 'medium' ? 'bg-risk-medium-bg border-risk-medium-border text-risk-medium-text'
                        : 'bg-risk-low-bg border-risk-low-border text-risk-low-text'}`}
                    >
                      {f.riskLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
