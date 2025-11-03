import { TransactionData, FraudPattern } from '@/types'

export class FraudDetector {
  static analyzeFraudPatterns(transactions: TransactionData[]): FraudPattern[] {
    const patterns: FraudPattern[] = []

    // Pattern 1: Card Testing (multiple small failed transactions in quick succession)
    const cardTestingPattern = this.detectCardTesting(transactions)
    if (cardTestingPattern) patterns.push(cardTestingPattern)

    // Pattern 2: Velocity Fraud (too many transactions in short time)
    const velocityPattern = this.detectVelocityFraud(transactions)
    if (velocityPattern) patterns.push(velocityPattern)

    // Pattern 3: High-Risk Geography
    const geoPattern = this.detectHighRiskGeography(transactions)
    if (geoPattern) patterns.push(geoPattern)

    // Pattern 4: Round Number Fraud (suspiciously round amounts)
    const roundNumberPattern = this.detectRoundNumberFraud(transactions)
    if (roundNumberPattern) patterns.push(roundNumberPattern)

    // Pattern 5: Off-Hours Transactions
    const offHoursPattern = this.detectOffHoursTransactions(transactions)
    if (offHoursPattern) patterns.push(offHoursPattern)

    // Pattern 6: Retry Attacks
    const retryPattern = this.detectRetryAttacks(transactions)
    if (retryPattern) patterns.push(retryPattern)

    // Pattern 7: High-Value International
    const highValueIntlPattern = this.detectHighValueInternational(transactions)
    if (highValueIntlPattern) patterns.push(highValueIntlPattern)

    // Pattern 8: Cryptocurrency Fraud
    const cryptoPattern = this.detectCryptocurrencyFraud(transactions)
    if (cryptoPattern) patterns.push(cryptoPattern)

    return patterns.sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return riskOrder[b.risk_level] - riskOrder[a.risk_level]
    })
  }

  private static detectCardTesting(transactions: TransactionData[]): FraudPattern | null {
    // Look for patterns of multiple small failed transactions
    const failedTransactions = transactions.filter(t => t.status === 'failed')
    const smallFailedTransactions = failedTransactions.filter(t => t.amount < 500) // Under $5
    
    // Group by customer and time proximity
    const customerGroups = new Map<string, TransactionData[]>()
    smallFailedTransactions.forEach(t => {
      if (t.customer) {
        if (!customerGroups.has(t.customer)) {
          customerGroups.set(t.customer, [])
        }
        customerGroups.get(t.customer)!.push(t)
      }
    })

    for (const [customer, txns] of customerGroups) {
      if (txns.length >= 5) {
        // Check if transactions are within a short time window (1 hour)
        const sortedTxns = txns.sort((a, b) => a.created - b.created)
        const timeSpan = sortedTxns[sortedTxns.length - 1].created - sortedTxns[0].created
        
        if (timeSpan <= 3600) { // 1 hour
          return {
            type: 'card_testing',
            description: `Card testing detected: ${txns.length} small failed transactions in ${Math.round(timeSpan/60)} minutes`,
            risk_level: 'critical',
            indicators: [
              'Multiple small-amount failures',
              'Rapid succession of attempts',
              'Same customer account',
              'Pattern consistent with card validation'
            ],
            affected_transactions: txns.map(t => t.id),
            recommendation: 'Block customer immediately and review all associated payment methods. Implement rate limiting for failed transactions.'
          }
        }
      }
    }

    return null
  }

  private static detectVelocityFraud(transactions: TransactionData[]): FraudPattern | null {
    // Look for too many transactions in short time from same source
    const recentTransactions = transactions.filter(t => 
      t.created > (Date.now() / 1000) - 1800 // Last 30 minutes
    )

    const customerGroups = new Map<string, TransactionData[]>()
    recentTransactions.forEach(t => {
      if (t.customer) {
        if (!customerGroups.has(t.customer)) {
          customerGroups.set(t.customer, [])
        }
        customerGroups.get(t.customer)!.push(t)
      }
    })

    for (const [customer, txns] of customerGroups) {
      if (txns.length >= 8) { // 8+ transactions in 30 minutes
        return {
          type: 'velocity_fraud',
          description: `Velocity fraud detected: ${txns.length} transactions in 30 minutes from customer ${customer}`,
          risk_level: 'high',
          indicators: [
            'High transaction frequency',
            'Short time window',
            'Same customer account',
            'Automated behavior pattern'
          ],
          affected_transactions: txns.map(t => t.id),
          recommendation: 'Apply velocity limits and require additional authentication for this customer.'
        }
      }
    }

    return null
  }

  private static detectHighRiskGeography(transactions: TransactionData[]): FraudPattern | null {
    const highRiskCountries = ['NG', 'GH', 'PK', 'BD', 'ID', 'RU']
    const highRiskTxns = transactions.filter(t => 
      t.metadata?.country && highRiskCountries.includes(t.metadata.country)
    )

    if (highRiskTxns.length >= 3) {
      const countries = [...new Set(highRiskTxns.map(t => t.metadata?.country))]
      const totalValue = highRiskTxns.reduce((sum, t) => sum + t.amount, 0)
      
      return {
        type: 'high_risk_geography',
        description: `${highRiskTxns.length} transactions from high-risk countries (${countries.join(', ')}) totaling $${(totalValue/100).toLocaleString()}`,
        risk_level: 'high',
        indicators: [
          'Transactions from high-risk countries',
          'Known fraud hotspots',
          'Geographic risk concentration',
          'Potential money laundering'
        ],
        affected_transactions: highRiskTxns.map(t => t.id),
        recommendation: 'Require enhanced verification for transactions from these countries. Consider manual review for amounts over $1000.'
      }
    }

    return null
  }

  private static detectRoundNumberFraud(transactions: TransactionData[]): FraudPattern | null {
    // Detect suspiciously round amounts (often indicates automated fraud)
    const roundNumbers = transactions.filter(t => {
      // Check if amount is divisible by large round numbers
      return (t.amount % 100000 === 0 && t.amount >= 100000) || // $1000+ multiples
             (t.amount % 50000 === 0 && t.amount >= 250000) || // $2500+ in $500 multiples  
             (t.amount % 25000 === 0 && t.amount >= 500000)   // $5000+ in $250 multiples
    })

    if (roundNumbers.length >= 3) {
      const totalValue = roundNumbers.reduce((sum, t) => sum + t.amount, 0)
      
      return {
        type: 'round_number_fraud',
        description: `${roundNumbers.length} transactions with suspiciously round amounts totaling $${(totalValue/100).toLocaleString()}`,
        risk_level: 'medium',
        indicators: [
          'Perfectly round transaction amounts',
          'Automated payment patterns',
          'Potential bot activity',
          'Unusual precision in amounts'
        ],
        affected_transactions: roundNumbers.map(t => t.id),
        recommendation: 'Review for automated fraud patterns. Consider adding transaction amount randomization detection.'
      }
    }

    return null
  }

  private static detectOffHoursTransactions(transactions: TransactionData[]): FraudPattern | null {
    // Detect transactions during unusual hours (typically 11 PM - 5 AM)
    const offHoursTxns = transactions.filter(t => {
      const hour = new Date(t.created * 1000).getHours()
      return (hour >= 23 || hour <= 5) // 11 PM to 5 AM
    })

    const highRiskOffHours = offHoursTxns.filter(t => 
      t.metadata?.country && ['RU', 'CN', 'PK', 'NG'].includes(t.metadata.country)
    )

    if (highRiskOffHours.length >= 2) {
      const totalValue = highRiskOffHours.reduce((sum, t) => sum + t.amount, 0)
      
      return {
        type: 'off_hours_fraud',
        description: `${highRiskOffHours.length} off-hours transactions from high-risk locations totaling $${(totalValue/100).toLocaleString()}`,
        risk_level: 'high',
        indicators: [
          'Transactions during unusual hours',
          'High-risk geographic locations',
          'Pattern consistent with stolen cards',
          'Time zone mismatches'
        ],
        affected_transactions: highRiskOffHours.map(t => t.id),
        recommendation: 'Flag for manual review. Consider time-based transaction limits for high-risk countries.'
      }
    }

    return null
  }

  private static detectRetryAttacks(transactions: TransactionData[]): FraudPattern | null {
    // Look for multiple failed attempts followed by success (card cracking)
    const customerGroups = new Map<string, TransactionData[]>()
    transactions.forEach(t => {
      if (t.customer && t.metadata?.attempt_number) {
        if (!customerGroups.has(t.customer)) {
          customerGroups.set(t.customer, [])
        }
        customerGroups.get(t.customer)!.push(t)
      }
    })

    for (const [customer, txns] of customerGroups) {
      const sortedTxns = txns.sort((a, b) => a.created - b.created)
      const failedAttempts = sortedTxns.filter(t => t.status === 'failed')
      const successfulAttempts = sortedTxns.filter(t => t.status === 'succeeded')
      
      if (failedAttempts.length >= 5 && successfulAttempts.length >= 1) {
        const lastFailed = failedAttempts[failedAttempts.length - 1]
        const firstSuccess = successfulAttempts[0]
        
        if (firstSuccess.created > lastFailed.created) {
          return {
            type: 'retry_attack',
            description: `Card cracking detected: ${failedAttempts.length} failed attempts followed by successful transaction`,
            risk_level: 'critical',
            indicators: [
              'Multiple sequential failures',
              'Successful transaction after failures',
              'Card number enumeration pattern',
              'Brute force attack signature'
            ],
            affected_transactions: sortedTxns.map(t => t.id),
            recommendation: 'Block customer and payment method immediately. Report to card issuer. Implement stronger retry limitations.'
          }
        }
      }
    }

    return null
  }

  private static detectHighValueInternational(transactions: TransactionData[]): FraudPattern | null {
    // Look for high-value transactions from international locations
    const highValueIntl = transactions.filter(t => 
      t.amount >= 500000 && // $5000+
      t.metadata?.country && 
      !['US', 'CA', 'GB', 'AU', 'DE', 'FR'].includes(t.metadata.country) // Not in common countries
    )

    if (highValueIntl.length >= 2) {
      const totalValue = highValueIntl.reduce((sum, t) => sum + t.amount, 0)
      const countries = [...new Set(highValueIntl.map(t => t.metadata?.country))]
      
      return {
        type: 'high_value_international',
        description: `${highValueIntl.length} high-value international transactions from ${countries.join(', ')} totaling $${(totalValue/100).toLocaleString()}`,
        risk_level: 'high',
        indicators: [
          'High transaction amounts',
          'International origins',
          'Uncommon geographic patterns',
          'Potential money laundering'
        ],
        affected_transactions: highValueIntl.map(t => t.id),
        recommendation: 'Require enhanced due diligence for high-value international transactions. Consider manual approval process.'
      }
    }

    return null
  }

  private static detectCryptocurrencyFraud(transactions: TransactionData[]): FraudPattern | null {
    const cryptoTxns = transactions.filter(t => 
      t.metadata?.merchant_category === 'cryptocurrency' ||
      t.description?.toLowerCase().includes('bitcoin') ||
      t.description?.toLowerCase().includes('crypto')
    )

    if (cryptoTxns.length >= 1) {
      const totalValue = cryptoTxns.reduce((sum, t) => sum + t.amount, 0)
      const anonymousTxns = cryptoTxns.filter(t => !t.customer || t.metadata?.country === 'VPN')
      
      if (totalValue >= 500000 || anonymousTxns.length > 0) { // $5000+ or anonymous
        return {
          type: 'cryptocurrency_fraud',
          description: `${cryptoTxns.length} cryptocurrency-related transactions totaling $${(totalValue/100).toLocaleString()}${anonymousTxns.length > 0 ? ' (includes anonymous transactions)' : ''}`,
          risk_level: totalValue >= 1000000 ? 'critical' : 'high', // Critical if $10k+
          indicators: [
            'Cryptocurrency exchange transactions',
            anonymousTxns.length > 0 ? 'Anonymous/VPN usage' : 'High transaction values',
            'Money laundering risk',
            'Regulatory compliance concerns'
          ],
          affected_transactions: cryptoTxns.map(t => t.id),
          recommendation: 'Enhanced KYC/AML screening required. Consider transaction limits for crypto exchanges. Monitor for suspicious patterns.'
        }
      }
    }

    return null
  }
}