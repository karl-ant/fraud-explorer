import { TransactionData } from '@/types'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export function getRiskScore(transaction: TransactionData): number {
  const parsed = parseInt(transaction.metadata?.risk_score || '0', 10)
  return isNaN(parsed) ? 0 : parsed
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const RISK_BADGE_CLASSES: Record<RiskLevel, { label: string; className: string }> = {
  critical: { label: 'CRIT', className: 'bg-risk-critical-bg border-risk-critical-border text-risk-critical-text' },
  high: { label: 'HIGH', className: 'bg-risk-high-bg border-risk-high-border text-risk-high-text' },
  medium: { label: 'MED', className: 'bg-risk-medium-bg border-risk-medium-border text-risk-medium-text' },
  low: { label: 'LOW', className: 'bg-risk-low-bg border-risk-low-border text-risk-low-text' },
}

export function getRiskBadgeConfig(level: RiskLevel) {
  return RISK_BADGE_CLASSES[level]
}

const RISK_BAR_CLASSES: Record<RiskLevel, string> = {
  critical: 'bg-[rgb(var(--risk-critical-text))]',
  high: 'bg-[rgb(var(--risk-high-text))]',
  medium: 'bg-[rgb(var(--risk-medium-text))]',
  low: 'bg-[rgb(var(--risk-low-text))]',
}

export function getRiskBarColor(level: RiskLevel): string {
  return RISK_BAR_CLASSES[level]
}
