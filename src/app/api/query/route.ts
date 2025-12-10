import { NextRequest, NextResponse } from 'next/server'
import { processQuery } from '@/lib/claude'
import StripeMCPClient from '@/lib/stripe-mcp'
import PayPalMockClient from '@/lib/paypal-mock'
import AdyenMockClient from '@/lib/adyen-mock'
import { FraudDetector } from '@/lib/fraud-detector'
import { TransactionData, QueryResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { query, processor = 'all', useRealStripe = false } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Process the natural language query with Claude
    console.log('Processing query with Claude:', query)
    const claudeResponse = await processQuery(query)

    // Use Claude's structured response to determine what data to fetch
    const filters = applyClaudeFilters(claudeResponse, query)
    
    let allTransactions: TransactionData[] = []

    // Fetch from selected processors
    if (processor === 'stripe' || processor === 'all') {
      const stripeMCP = new StripeMCPClient()
      const stripeTransactions = await stripeMCP.listCharges(filters, useRealStripe)
      allTransactions.push(...stripeTransactions as TransactionData[])
    }

    if (processor === 'paypal' || processor === 'all') {
      const paypalMock = new PayPalMockClient()
      const paypalTransactions = await paypalMock.listTransactions(filters)
      allTransactions.push(...paypalTransactions)
    }

    if (processor === 'adyen' || processor === 'all') {
      const adyenMock = new AdyenMockClient()
      const adyenTransactions = await adyenMock.listTransactions(filters)
      allTransactions.push(...adyenTransactions)
    }

    // Sort all transactions by date (most recent first)
    allTransactions.sort((a, b) => b.created - a.created)

    // Apply limit after combining results
    if (filters.limit) {
      allTransactions = allTransactions.slice(0, filters.limit)
    }

    // Detect fraud patterns
    const fraudPatterns = FraudDetector.analyzeFraudPatterns(allTransactions)

    // Generate summary based on the query and results
    const summary = generateSummary(query, allTransactions, fraudPatterns)

    const response: QueryResponse = {
      data: allTransactions,
      summary,
      fraud_patterns: fraudPatterns
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to process query' 
      },
      { status: 500 }
    )
  }
}

function applyClaudeFilters(claudeResponse: any, fallbackQuery: string) {
  const filters: any = {}

  try {
    const { filters: claudeFilters } = claudeResponse

    // Status filter - API supports single status
    if (claudeFilters?.status && claudeFilters.status.length > 0) {
      filters.status = claudeFilters.status[0]
    }

    // Amount filter (amounts from Claude are in cents)
    if (claudeFilters?.amount) {
      filters.amount = {}
      if (claudeFilters.amount.min !== null && claudeFilters.amount.min !== undefined) {
        filters.amount.gte = claudeFilters.amount.min
      }
      if (claudeFilters.amount.max !== null && claudeFilters.amount.max !== undefined) {
        filters.amount.lte = claudeFilters.amount.max
      }
    }

    // Time range filter
    if (claudeFilters?.timeRange) {
      filters.created = {}
      const now = Math.floor(Date.now() / 1000)

      if (claudeFilters.timeRange.relative) {
        const ranges: Record<string, number> = {
          'today': now - (now % 86400),
          'last_week': now - (7 * 24 * 60 * 60),
          'last_month': now - (30 * 24 * 60 * 60),
          'last_30_days': now - (30 * 24 * 60 * 60)
        }
        if (ranges[claudeFilters.timeRange.relative]) {
          filters.created.gte = ranges[claudeFilters.timeRange.relative]
        }
      } else {
        if (claudeFilters.timeRange.start) {
          filters.created.gte = Math.floor(new Date(claudeFilters.timeRange.start).getTime() / 1000)
        }
        if (claudeFilters.timeRange.end) {
          filters.created.lte = Math.floor(new Date(claudeFilters.timeRange.end).getTime() / 1000)
        }
      }
    }

    // Additional filters
    if (claudeFilters?.currency) filters.currency = claudeFilters.currency
    if (claudeFilters?.country) filters.country = claudeFilters.country
    if (claudeFilters?.customer) filters.customer = claudeFilters.customer

    // Default limit
    if (!filters.limit) {
      filters.limit = 100
    }

    return filters
  } catch (error) {
    console.error('Failed to apply Claude filters, falling back to regex:', error)
    // Fallback to legacy parsing if Claude parsing fails
    return parseQueryToFiltersLegacy(fallbackQuery)
  }
}

// Legacy fallback function for when Claude parsing fails
function parseQueryToFiltersLegacy(query: string) {
  const filters: any = {}
  const queryLower = query.toLowerCase()

  // Status filters
  if (queryLower.includes('failed')) {
    filters.status = 'failed'
  } else if (queryLower.includes('successful') || queryLower.includes('succeeded')) {
    filters.status = 'succeeded'
  } else if (queryLower.includes('pending')) {
    filters.status = 'pending'
  }

  // Time-based filters
  const now = Math.floor(Date.now() / 1000)
  if (queryLower.includes('last week') || queryLower.includes('past week')) {
    filters.created = { gte: now - (7 * 24 * 60 * 60) }
  } else if (queryLower.includes('last month') || queryLower.includes('past month')) {
    filters.created = { gte: now - (30 * 24 * 60 * 60) }
  } else if (queryLower.includes('last 30 days')) {
    filters.created = { gte: now - (30 * 24 * 60 * 60) }
  } else if (queryLower.includes('today')) {
    const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
    filters.created = { gte: startOfDay }
  }

  // Amount filters
  const amountMatch = queryLower.match(/\$(\d+)/)
  if (amountMatch) {
    const amount = parseInt(amountMatch[1]) * 100 // Convert to cents
    if (queryLower.includes('over') || queryLower.includes('above')) {
      filters.amount = { gte: amount }
    } else if (queryLower.includes('under') || queryLower.includes('below')) {
      filters.amount = { lte: amount }
    }
  }

  // Range filters like $100-$1000
  const rangeMatch = queryLower.match(/\$(\d+)-\$(\d+)/)
  if (rangeMatch) {
    const minAmount = parseInt(rangeMatch[1]) * 100
    const maxAmount = parseInt(rangeMatch[2]) * 100
    filters.amount = { gte: minAmount, lte: maxAmount }
  }

  // Default limit to prevent overwhelming results
  if (!filters.limit) {
    filters.limit = 100
  }

  return filters
}

function generateSummary(query: string, transactions: TransactionData[], fraudPatterns: any[] = []): string {
  const total = transactions.length
  const successful = transactions.filter(t => t.status === 'succeeded').length
  const failed = transactions.filter(t => t.status === 'failed').length
  const pending = transactions.filter(t => t.status === 'pending').length

  const totalAmount = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount, 0)

  const avgAmount = successful > 0 ? totalAmount / successful : 0

  let summary = `Found ${total} transactions. `
  
  if (successful > 0) {
    summary += `${successful} successful ($${(totalAmount / 100).toLocaleString()}), `
  }
  if (failed > 0) {
    summary += `${failed} failed, `
  }
  if (pending > 0) {
    summary += `${pending} pending, `
  }

  // Remove trailing comma and space
  summary = summary.replace(/, $/, '. ')

  if (successful > 0) {
    summary += `Average successful transaction: $${(avgAmount / 100).toFixed(2)}. `
  }

  // Add fraud pattern summary
  if (fraudPatterns.length > 0) {
    const criticalPatterns = fraudPatterns.filter(p => p.risk_level === 'critical').length
    const highPatterns = fraudPatterns.filter(p => p.risk_level === 'high').length
    
    summary += `🚨 FRAUD ALERT: ${fraudPatterns.length} suspicious pattern${fraudPatterns.length > 1 ? 's' : ''} detected`
    if (criticalPatterns > 0) {
      summary += ` (${criticalPatterns} critical${criticalPatterns > 1 ? '' : ''}`
      if (highPatterns > 0) summary += `, ${highPatterns} high risk`
      summary += `)`
    } else if (highPatterns > 0) {
      summary += ` (${highPatterns} high risk)`
    }
    summary += `. Immediate review recommended.`
  }

  return summary
}