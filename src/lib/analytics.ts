import { TransactionData, FraudPattern } from '@/types'

export interface StatusDistribution {
  status: string
  count: number
  percentage: number
}

export interface ProcessorBreakdown {
  processor: string
  count: number
  volume: number
}

export interface VolumeByDay {
  date: string
  count: number
  volume: number
}

export interface FraudSummary {
  patternType: string
  count: number
  riskLevel: string
}

export interface OverviewStats {
  total: number
  volume: number
  avgAmount: number
  fraudRate: number
}

export function computeStatusDistribution(txns: TransactionData[]): StatusDistribution[] {
  const counts = new Map<string, number>()
  for (const t of txns) {
    counts.set(t.status, (counts.get(t.status) || 0) + 1)
  }

  const total = txns.length || 1
  return Array.from(counts.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / total) * 100),
  }))
}

export function computeProcessorBreakdown(txns: TransactionData[]): ProcessorBreakdown[] {
  const groups = new Map<string, { count: number; volume: number }>()
  for (const t of txns) {
    const proc = t.processor || 'unknown'
    const existing = groups.get(proc) || { count: 0, volume: 0 }
    existing.count++
    existing.volume += t.amount
    groups.set(proc, existing)
  }

  return Array.from(groups.entries()).map(([processor, data]) => ({
    processor,
    count: data.count,
    volume: data.volume,
  }))
}

export function computeVolumeByDay(txns: TransactionData[]): VolumeByDay[] {
  const groups = new Map<string, { count: number; volume: number }>()
  for (const t of txns) {
    const date = new Date(t.created * 1000).toISOString().split('T')[0]
    const existing = groups.get(date) || { count: 0, volume: 0 }
    existing.count++
    existing.volume += t.amount
    groups.set(date, existing)
  }

  return Array.from(groups.entries())
    .map(([date, data]) => ({ date, count: data.count, volume: data.volume }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function computeFraudSummary(txns: TransactionData[], patterns: FraudPattern[]): FraudSummary[] {
  return patterns.map(p => ({
    patternType: p.type,
    count: p.affected_transactions.length,
    riskLevel: p.risk_level,
  }))
}

export function computeOverviewStats(txns: TransactionData[], patterns: FraudPattern[] = []): OverviewStats {
  const total = txns.length
  const volume = txns.reduce((sum, t) => sum + t.amount, 0)
  const avgAmount = total > 0 ? volume / total : 0
  const affectedIds = new Set(patterns.flatMap(p => p.affected_transactions))
  const fraudRate = total > 0 ? (affectedIds.size / total) * 100 : 0

  return { total, volume, avgAmount, fraudRate }
}
