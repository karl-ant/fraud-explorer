# Fraud Explorer

## Critical Instructions
- Do not use the public npm registry, only the internal registry

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
- **Stripe MCP client**: `src/lib/stripe-mcp.ts`
- **PayPal mock client**: `src/lib/paypal-mock.ts`
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

## Common Development Tasks

### Adding New Fraud Patterns
1. Add detection logic to `src/lib/fraud-detector.ts`
2. Update types in `src/types/index.ts`

### Adding New Payment Processors
1. Create client in `src/lib/[processor]-mock.ts`
2. Add to API route in `src/app/api/query/route.ts`
3. Add processor option to `src/components/QueryInterface.tsx`
- please only run the app on port 3000