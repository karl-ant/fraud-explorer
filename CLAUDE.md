# Fraud Explorer

> **Version**: 1.1.0 | **Last Updated**: 2025-12-11

## Critical Instructions
- Do not use the public npm registry, only the internal registry
- Always run the app on port 3000 (default)

## Recent Changes (v1.1.0)
- **Theme Update**: Lightened dark theme from near-black to dark slate blue for better readability
- **Accordion UI**: Example queries now collapsed by default with expandable accordion
- **Collapsible Fraud Cards**: Fraud pattern cards now show compact headers, expand on click

## Environment Variables (.env.local)
```
ANT_API_KEY=<your_anthropic_api_key>
STRIPE_SECRET_KEY=<your_stripe_secret_key>
```

## Commands
```bash
npm run dev     # Start development server
npm run build   # Production build
npm run lint    # Run ESLint
```

## Key Entry Points
- **API endpoint**: `src/app/api/query/route.ts`
- **Fraud detection**: `src/lib/fraud-detector.ts`
- **Payment processor clients**:
  - **Stripe MCP client**: `src/lib/stripe-mcp.ts`
  - **PayPal mock client**: `src/lib/paypal-mock.ts`
  - **Adyen mock client**: `src/lib/adyen-mock.ts`
- **Mock transaction generator**: `src/lib/mock-generator.ts`
- **Types**: `src/types/index.ts`
- **Claude integration**: `src/lib/claude.ts`

## Stripe MCP Integration

The app supports both mock and real Stripe data via `src/lib/stripe-mcp.ts`.

### Enabling Real Stripe Data
Pass `useRealStripe: true` in API requests to `/api/query`:
```json
{ "query": "show failed transactions", "processor": "stripe", "useRealStripe": true }
```

### How It Works
- Connects to `https://mcp.stripe.com` using `STRIPE_SECRET_KEY` for auth
- Primary tool: `search_stripe_resources` with Stripe search syntax
- Fallback tool: `list_payment_intents` if search returns empty
- Status mapping: Stripe statuses (`requires_payment_method`, `requires_action`, etc.) are mapped to app statuses (`failed`, `pending`, `succeeded`)

### Search Query Examples
- Failed: `payment_intents:status:"failed" OR payment_intents:status:"requires_payment_method"`
- Succeeded: `payment_intents:status:"succeeded"`
- Pending: `payment_intents:status:"requires_confirmation" OR payment_intents:status:"requires_action"`

## Claude Query Processing

The app uses Claude to parse natural language queries into structured filters.

### Query Flow
1. User enters natural language query (e.g., "failed Adyen transactions over $1000")
2. `src/lib/claude.ts` sends query to Claude with structured prompt
3. Claude returns JSON with filters, intent, and explanation
4. `src/app/api/query/route.ts` applies filters to fetch transactions
5. Falls back to regex parsing if Claude response is invalid

### Important Implementation Details
- **Markdown Stripping**: Claude responses are automatically stripped of markdown code blocks (` ```json ... ``` `)
- **Validation**: Responses are validated for structure; defaults are provided for missing fields
- **Error Handling**: API errors are propagated to users; parsing errors trigger regex fallback
- **Amounts**: All amounts are in cents (e.g., $10 = 1000)

## Mock Transaction Generator

`src/lib/mock-generator.ts` and `src/components/MockTransactionGenerator.tsx` provide a UI for generating test data.

### Features
- Configurable transaction count (1-10,000)
- Processor selection (Stripe, PayPal, Adyen)
- Date range selection
- Fraud pattern mix (8 patterns + legitimate)
- Status distribution (succeeded, failed, pending, canceled)

### Validation
- Fraud mix must sum to 100%
- Status distribution must sum to 100%
- All percentages must be 0-100
- Start date must be before end date

## Common Development Tasks

### Adding New Fraud Patterns
1. Add detection logic to `src/lib/fraud-detector.ts`
2. Update types in `src/types/index.ts`

### Adding New Payment Processors
1. Create client in `src/lib/[processor]-mock.ts` following PayPal/Adyen pattern
2. Add import and instantiation in `src/app/api/query/route.ts`
3. Add processor option to `src/components/QueryInterface.tsx`
4. Add badge styling in `src/components/DataTable.tsx`
5. Update footer in `src/app/page.tsx`
6. Update types in `src/types/index.ts` to include new processor

**Example:** See `src/lib/adyen-mock.ts` for reference implementation with 8 fraud patterns.

## Troubleshooting

### "Failed to parse AI response"
- **Cause**: Claude returned non-JSON or malformed JSON
- **Check**: Server console shows "Claude response preview" with actual response
- **Solution**: Already handles markdown code blocks; if still failing, check Claude prompt

### "Failed to process query with Claude"
- **Cause**: API error or authentication issue
- **Check**: Server console for "Claude API error"
- **Solution**: Verify ANT_API_KEY is set in .env.local

### Mock Generator Errors
- **Cause**: Invalid configuration (percentages don't sum to 100%, invalid count, etc.)
- **Solution**: Check browser console for validation error messages

## UI/Styling System

### Theme Colors (`tailwind.config.js`)
The app uses a "mission control" dark slate blue theme:
- `space-deep`: `#0d1526` - Body background
- `space-800`: `#1a2840` - Panels/cards
- `space-700`: `#20304a` - Interactive surfaces
- `terminal-500`: `#00a8ff` - Primary accent (cyan blue)

### Accordion Components (`globals.css`)
Collapsible sections use CSS grid-based animations:
```css
.accordion-content { display: grid; grid-template-rows: 0fr; }
.accordion-content.expanded { grid-template-rows: 1fr; }
.accordion-inner { overflow: hidden; }
```

### Key UI Components
- **QueryInterface**: Example queries collapsed by default, toggle via accordion header
- **FraudPatterns**: Pattern cards show compact headers (icon, name, badge, count), expand to show full details