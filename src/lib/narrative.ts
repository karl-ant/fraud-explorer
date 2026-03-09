import { TransactionData, FraudPattern } from '@/types'

const RISK_ORDER: Record<FraudPattern['risk_level'], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function formatDollar(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

/**
 * Sums the dollar amount of all transactions affected by a pattern.
 */
export function computePatternExposure(
  pattern: FraudPattern,
  transactions: TransactionData[]
): number {
  const affectedIds = new Set(pattern.affected_transactions)
  return transactions
    .filter(t => affectedIds.has(t.id))
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Builds a pattern-specific lead sentence with dollar amounts and context
 * interpolated from the affected transactions.
 */
function buildPatternLead(
  pattern: FraudPattern,
  transactions: TransactionData[]
): string {
  const level = pattern.risk_level.toUpperCase()
  const affectedIds = new Set(pattern.affected_transactions)
  const affected = transactions.filter(t => affectedIds.has(t.id))
  const exposure = affected.reduce((sum, t) => sum + t.amount, 0)
  const n = affected.length

  switch (pattern.type) {
    case 'card_testing': {
      const sorted = affected.slice().sort((a, b) => a.created - b.created)
      const durationMin = sorted.length >= 2
        ? Math.max(1, Math.round((sorted[sorted.length - 1].created - sorted[0].created) / 60))
        : 1
      return `${level}: Card testing attack — ${n} micro-charge probes in ${durationMin} min.`
    }

    case 'retry_attack': {
      const succeeded = affected.filter(t => t.status === 'succeeded')
      const failed = affected.filter(t => t.status === 'failed')
      const breakthrough = succeeded[0]
      if (breakthrough) {
        const customer = breakthrough.customer ? ` (customer ${breakthrough.customer})` : ''
        return `${level}: Card cracking succeeded — ${failed.length} failed probes then a ${formatDollar(breakthrough.amount)} breakthrough${customer}.`
      }
      return `${level}: Retry attack — ${n} rapid payment attempts detected.`
    }

    case 'velocity_fraud': {
      const customers = new Set(affected.map(t => t.customer).filter(Boolean))
      const who = customers.size === 1
        ? `from ${[...customers][0]}`
        : `across ${customers.size} accounts`
      return `${level}: Velocity spike — ${n} transactions in 30 min ${who}.`
    }

    case 'high_risk_geography': {
      const countries = [...new Set(affected.map(t => t.metadata?.country).filter(Boolean))]
      return `${level}: ${formatDollar(exposure)} from high-risk regions (${countries.join(', ')}).`
    }

    case 'cryptocurrency_fraud': {
      const anonymous = affected.some(t => !t.customer || t.metadata?.country === 'VPN')
      const suffix = anonymous ? ' with anonymous sources' : ''
      return `${level}: ${formatDollar(exposure)} in crypto exchange activity${suffix}.`
    }

    case 'off_hours_fraud': {
      const countries = [...new Set(affected.map(t => t.metadata?.country).filter(Boolean))]
      return `${level}: ${n} off-hours transactions from ${countries.join(', ')} totaling ${formatDollar(exposure)}.`
    }

    case 'high_value_international': {
      const countries = [...new Set(affected.map(t => t.metadata?.country).filter(Boolean))]
      return `${level}: ${n} high-value international transactions from ${countries.join(', ')} totaling ${formatDollar(exposure)}.`
    }

    case 'round_number_fraud': {
      return `${level}: ${n} suspiciously round amounts totaling ${formatDollar(exposure)} — possible automation.`
    }

    default:
      return `${level}: ${pattern.description}`
  }
}

/**
 * Builds an analyst-style briefing summary that leads with the most severe
 * finding and quantifies financial exposure.
 */
export function buildNarrativeSummary(
  transactions: TransactionData[],
  patterns: FraudPattern[]
): string {
  const total = transactions.length
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0)

  // No patterns: reassuring green summary
  if (patterns.length === 0) {
    const succeeded = transactions.filter(t => t.status === 'succeeded').length
    const successRate = total > 0 ? Math.round((succeeded / total) * 100) : 0
    return `Scanned ${total.toLocaleString()} transactions — no fraud signals detected. ${formatDollar(totalVolume)} total volume, ${successRate}% success rate.`
  }

  // Sort patterns by severity (highest first)
  const sorted = patterns.slice().sort(
    (a, b) => RISK_ORDER[b.risk_level] - RISK_ORDER[a.risk_level]
  )
  const top = sorted[0]

  // Lead with the most severe pattern
  const lead = `🚨 ${buildPatternLead(top, transactions)}`

  // Aggregate exposure across all patterns (dedup affected IDs)
  const allAffectedIds = new Set(patterns.flatMap(p => p.affected_transactions))
  const atRisk = transactions
    .filter(t => allAffectedIds.has(t.id))
    .reduce((sum, t) => sum + t.amount, 0)

  const critical = patterns.filter(p => p.risk_level === 'critical').length
  const high = patterns.filter(p => p.risk_level === 'high').length
  const severityParts: string[] = []
  if (critical > 0) severityParts.push(`${critical} critical`)
  if (high > 0) severityParts.push(`${high} high`)
  const severitySuffix = severityParts.length > 0 ? ` (${severityParts.join(', ')})` : ''

  const patternWord = patterns.length === 1 ? 'pattern' : 'patterns'
  const exposure = `${formatDollar(atRisk)} at risk across ${patterns.length} ${patternWord}${severitySuffix}.`

  const scope = `${total.toLocaleString()} transactions scanned.`

  return `${lead} ${exposure} ${scope}`
}
