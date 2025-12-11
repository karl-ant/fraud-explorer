import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANT_API_KEY,
})

export async function processQuery(query: string) {
  const systemPrompt = `You are a fraud analyst assistant that interprets natural language queries about payment transaction data.

Analyze the user's query and return a JSON object with these fields:

{
  "filters": {
    "status": ["succeeded" | "failed" | "pending" | "canceled"] | null,
    "processors": ["stripe" | "paypal" | "adyen"] | null,
    "amount": { "min": number | null, "max": number | null } | null,
    "currency": string | null,
    "country": string | null,
    "timeRange": {
      "start": ISO8601 string | null,
      "end": ISO8601 string | null,
      "relative": "today" | "last_week" | "last_month" | "last_30_days" | null
    } | null,
    "customer": string | null,
    "fraudIndicators": string[] | null
  },
  "intent": "analysis" | "fraud_detection" | "transaction_list" | "summary",
  "explanation": "Brief explanation of what the query is asking for"
}

Examples:
- "failed transactions over $1000 from Nigeria last week"
  → filters: { status: ["failed"], amount: { min: 100000 }, country: "NG", timeRange: { relative: "last_week" } }

- "show me card testing attempts across all processors"
  → filters: { fraudIndicators: ["card_testing"] }, intent: "fraud_detection"

Return ONLY valid JSON, no additional text.`

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
      try {
        const parsed = JSON.parse(content.text)

        // Validate structure - filters and intent are optional but should be correct type if present
        if (parsed.filters !== undefined && (parsed.filters === null || typeof parsed.filters !== 'object')) {
          console.warn('Unexpected filters type, using empty object')
          parsed.filters = {}
        }

        if (parsed.intent !== undefined && typeof parsed.intent !== 'string') {
          console.warn('Unexpected intent type, using default')
          parsed.intent = 'analysis'
        }

        // Ensure filters object exists even if Claude didn't provide it
        if (!parsed.filters) {
          parsed.filters = {}
        }

        return parsed
      } catch (error) {
        console.error('Failed to parse Claude response as JSON:', error instanceof Error ? error.message : error)
        // Log first 100 chars only for debugging (avoid data leakage)
        if (error instanceof Error && error.message.includes('JSON')) {
          console.debug('Response preview:', content.text.substring(0, 100))
        }
        throw new Error('Invalid Claude response format')
      }
    }

    throw new Error('Unexpected response format from Claude')
  } catch (error) {
    console.error('Claude API error:', error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid Claude response format')) {
        throw new Error('Failed to parse AI response. Please try rephrasing your query.')
      }
      if (error.message.includes('API key')) {
        throw new Error('AI service configuration error. Please check API key.')
      }
      // Pass through the original error message for other cases
      throw error
    }

    throw new Error('Failed to process query with Claude')
  }
}