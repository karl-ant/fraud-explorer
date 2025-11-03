# Fraud Explorer MVP

A unified transaction analysis tool that allows risk department users to query transaction data across payment processors using natural language queries powered by Claude AI and Stripe's MCP server.

## Features

- **Natural Language Queries**: Ask questions about transaction data in plain English
- **Unified Transaction View**: Analyze data from multiple payment processors in one interface
- **Real-time Analysis**: Get instant insights powered by Claude AI
- **Interactive Data Table**: Sort, filter, and explore transaction results
- **Risk-focused Interface**: Built specifically for fraud and risk analysts

## Quick Start

### Prerequisites

- Node.js 18+ 
- An Anthropic API key (for Claude)
- A Stripe account with API access (for transaction data)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```
   ANTHROPIC_API_KEY=your_claude_api_key_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage Examples

Try these natural language queries:

- "Show me all failed transactions from the last 30 days"
- "Analyze successful vs failed transactions this month"
- "List all transactions between $100-$1000"
- "Show me pending payments from today"

## Architecture

### Frontend
- **Next.js 14** with React and TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for server-side logic
- **Anthropic SDK** for Claude AI integration
- **Model Context Protocol (MCP)** for Stripe integration

### Key Components

1. **Query Interface** (`src/components/QueryInterface.tsx`)
   - Natural language input with example queries
   - Loading states and user feedback

2. **Data Table** (`src/components/DataTable.tsx`)
   - Sortable columns with transaction data
   - Status indicators and formatting
   - Responsive design for different screen sizes

3. **Claude Integration** (`src/lib/claude.ts`)
   - Processes natural language queries
   - Determines appropriate Stripe API calls
   - Provides analysis context

4. **Stripe MCP Client** (`src/lib/stripe-mcp.ts`)
   - Connects to Stripe's MCP server
   - Handles transaction data retrieval
   - Mock data for MVP demonstration

## Environment Setup

### Getting API Keys

1. **Anthropic API Key**:
   - Sign up at https://console.anthropic.com/
   - Navigate to API keys section
   - Create a new API key and copy it

2. **Stripe API Key**:
   - Log in to your Stripe Dashboard
   - Go to Developers > API keys
   - Copy your Secret key (starts with `sk_`)

### Production Deployment

For production deployment:

1. **Environment Variables**: Set up the same environment variables in your hosting platform
2. **Stripe MCP**: Replace the mock client with actual Stripe MCP server integration
3. **Security**: Implement proper authentication and authorization
4. **Rate Limiting**: Add rate limiting for API endpoints
5. **Error Monitoring**: Set up error tracking and monitoring

## Development

### Project Structure
```
src/
├── app/              # Next.js app directory
│   ├── api/          # API routes
│   └── globals.css   # Global styles
├── components/       # React components
├── lib/             # Utility libraries
└── types/           # TypeScript type definitions
```

### Adding New Features

1. **New Query Types**: Extend the query parsing logic in `src/app/api/query/route.ts`
2. **Additional Data Sources**: Create new MCP clients in `src/lib/`
3. **Enhanced UI**: Add new components in `src/components/`

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your environment variables are properly set
2. **Build Errors**: Check that all dependencies are installed with `npm install`
3. **TypeScript Errors**: Run `npm run build` to check for type issues

### Getting Help

For issues with:
- **Claude AI**: Check Anthropic's documentation
- **Stripe MCP**: Refer to Stripe's MCP documentation
- **Next.js**: Consult Next.js documentation

## Next Steps

This MVP demonstrates the core concept. For production:

1. **Real Stripe MCP Integration**: Replace mock data with actual Stripe MCP server
2. **Multi-processor Support**: Add support for other payment processors
3. **Advanced Analytics**: Implement more sophisticated fraud detection algorithms
4. **User Management**: Add authentication and user-specific data access
5. **Export Features**: Allow users to export analysis results
6. **Dashboard Features**: Create saved queries and dashboard views

## License

This project is for demonstration purposes. Ensure compliance with all relevant APIs' terms of service.