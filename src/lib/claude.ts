import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANT_API_KEY,
})

export async function processQuery(query: string) {
  const systemPrompt = `You are a fraud analyst assistant that helps users query Stripe transaction data. 

Your role is to:
1. Interpret natural language queries about transaction data
2. Convert them to appropriate Stripe API calls via MCP
3. Format and analyze the results

Available Stripe operations via MCP:
- List payments/charges
- Filter by status (succeeded, failed, pending, canceled)  
- Filter by date ranges
- Filter by amount ranges
- Filter by customer
- Get customer details
- Search by metadata

When a user asks for transaction analysis:
1. Determine what Stripe API calls are needed
2. Suggest the appropriate MCP tool calls
3. Provide analysis of the results

Examples:
- "failed transactions last week" -> list charges with status=failed, created filter
- "transactions over $100" -> list charges with amount filter
- "stripe traffic between dates" -> list charges with date range filter

Respond with a JSON object containing:
- "api_calls": array of suggested Stripe API operations
- "filters": object with filter parameters
- "analysis_type": type of analysis requested

User query: ${query}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: query
        }
      ],
      system: systemPrompt
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
    
    throw new Error('Unexpected response format from Claude')
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to process query with Claude')
  }
}