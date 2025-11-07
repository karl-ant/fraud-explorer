# Claude Code Session Context - Fraud Explorer

## Project Overview
**Fraud Explorer** is a sophisticated MVP for transaction analysis and fraud detection across multiple payment processors. It provides a unified view of transaction data with AI-powered natural language queries and comprehensive fraud pattern detection.

## Current Implementation Status ✅

### Core Features Completed
- ✅ **Next.js 14** application with TypeScript
- ✅ **Natural Language Query Interface** powered by Claude AI
- ✅ **Multi-Processor Support**: Stripe + PayPal mock data
- ✅ **Advanced Fraud Detection**: 8 different fraud pattern algorithms
- ✅ **Interactive Data Visualization** with sortable tables
- ✅ **100+ Diverse Transaction Dataset** with realistic fraud patterns

### Architecture
```
Frontend: Next.js + React + TypeScript + Tailwind CSS
Backend: Next.js API Routes
AI: Claude 3.5 Sonnet via Anthropic SDK
Data Sources: Stripe MCP + PayPal Mock Client
Fraud Detection: Custom pattern analysis algorithms
```

### Key Files & Components

**Core Application:**
- `src/app/page.tsx` - Main application page with query interface
- `src/app/layout.tsx` - Application layout and global styles
- `src/app/api/query/route.ts` - Main API endpoint for processing queries

**Components:**
- `src/components/QueryInterface.tsx` - Natural language query input with processor selection
- `src/components/DataTable.tsx` - Interactive transaction data table
- `src/components/FraudPatterns.tsx` - Fraud pattern visualization component

**Data & Logic:**
- `src/lib/claude.ts` - Claude AI integration for query processing
- `src/lib/stripe-mcp.ts` - Stripe MCP client (currently with mock data)
- `src/lib/paypal-mock.ts` - PayPal mock client with 100+ transactions
- `src/lib/fraud-detector.ts` - Advanced fraud pattern detection algorithms
- `src/lib/error-handler.ts` - Centralized error handling

**Types & Config:**
- `src/types/index.ts` - TypeScript interfaces for transactions, queries, fraud patterns
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Tailwind CSS configuration

## Current Data Structure

### Transaction Data (100+ records)
- **Stripe**: 5 basic transactions (original mock data)
- **PayPal**: 100+ diverse transactions including:
  - Card testing patterns (15 rapid small transactions)
  - High-value international transactions ($8.5K EUR, $12K GBP)
  - Round number fraud patterns ($5K, $10K, $20K)
  - Off-hours transactions (3 AM from high-risk countries)
  - Retry attack patterns (8 failures → 1 success)
  - Velocity fraud (12 transactions in 10 minutes)
  - Cryptocurrency fraud ($5K-$10K crypto exchanges)
  - Legitimate transactions mixed throughout

### Fraud Patterns Detected
1. **Card Testing** - Critical risk pattern detection
2. **Velocity Fraud** - High-frequency transaction detection
3. **High-Risk Geography** - Country-based risk analysis
4. **Round Number Fraud** - Automated payment detection
5. **Off-Hours Transactions** - Time-based suspicious activity
6. **Retry Attacks** - Card cracking attempt detection
7. **High-Value International** - Cross-border suspicious activity
8. **Cryptocurrency Fraud** - Money laundering risk detection

## Environment Setup

### Required Environment Variables (.env.local)
```
ANT_API_KEY=your_claude_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

### Development Commands
```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run lint            # Run ESLint
```

## Fraud Detection Narratives & Use Cases

### Example Queries That Demonstrate Fraud Patterns
```
🚨 FRAUD DETECTION QUERIES:
- "Show me all suspicious transaction patterns from today"
- "Analyze card testing attacks from the last hour"
- "Find high-risk international transactions over $5000"
- "Detect cryptocurrency fraud patterns"
- "Show velocity fraud attempts in PayPal"
- "Find round-number fraud patterns"
- "Analyze off-hours transactions from high-risk countries" 
- "Show retry attack patterns and card cracking attempts"

📊 GENERAL ANALYSIS QUERIES:
- "Show me all failed transactions from the last 30 days"
- "Analyze successful vs failed transactions this month"
- "List all transactions between $100-$1000"
- "Show transactions with high risk scores"
```

## Technical Implementation Notes

### Key Features
- **Processor Selection**: Users can query Stripe only, PayPal only, or all processors
- **Real-time Fraud Analysis**: Every query runs through fraud detection algorithms
- **Risk-based UI**: Fraud alerts appear in red, normal summaries in blue
- **Detailed Pattern Analysis**: Each fraud pattern shows indicators, affected transactions, and recommendations

### Fraud Detection Algorithm Details
- **Risk Scoring**: Critical > High > Medium > Low
- **Pattern Matching**: Time-based, amount-based, geography-based, and behavioral analysis
- **Recommendation Engine**: Specific actions for each fraud type
- **Transaction Grouping**: Clusters related suspicious activities

### Mock Data Realism
- **Geographic Diversity**: US, Canada, Europe, high-risk countries (Nigeria, Russia, Pakistan)
- **Currency Variety**: USD, EUR, GBP, CAD
- **Realistic Amounts**: From $1.25 coffee purchases to $20K business transactions
- **Authentic Fraud Patterns**: Based on real-world fraud detection scenarios
- **Temporal Patterns**: Transactions spread across different times/dates

## Production Readiness Notes

### What's Ready for Production
- Complete fraud detection engine
- Multi-processor architecture
- Professional UI/UX
- Error handling and loading states
- TypeScript type safety
- Responsive design

### What Needs Production Enhancement
1. **Real Stripe MCP Integration**: Replace mock Stripe data with actual MCP server
2. **Authentication**: Add user login and role-based access
3. **Database Storage**: Persist transaction and analysis data
4. **Additional Processors**: Square, Adyen, etc.
5. **Advanced Analytics**: Dashboard views, trend analysis
6. **Export Features**: CSV, PDF reports
7. **Real-time Monitoring**: WebSocket updates for live fraud detection

## Common Development Tasks

### Adding New Fraud Patterns
1. Add detection logic to `src/lib/fraud-detector.ts`
2. Update fraud pattern types in `src/types/index.ts`
3. Test with relevant mock data

### Adding New Payment Processors
1. Create new mock client in `src/lib/[processor]-mock.ts`
2. Update API route in `src/app/api/query/route.ts`
3. Add processor option to UI components

### Modifying Query Processing
1. Update Claude prompt in `src/lib/claude.ts`
2. Enhance filter parsing in `src/app/api/query/route.ts`
3. Test with various natural language queries

## Current Server Info
- **Development Server**: Running on http://localhost:3002
- **Environment**: .env.local loaded with API keys
- **Build Status**: Successfully compiles with no errors
- **Dependencies**: All installed and up to date

This document provides complete context for continuing development of the Fraud Explorer application in future Claude Code sessions.
- Do not use the public npm registry, only the internal