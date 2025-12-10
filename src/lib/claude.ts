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
        return JSON.parse(content.text)
      } catch (error) {
        console.error('Failed to parse Claude response as JSON:', content.text)
        throw new Error('Invalid Claude response format')
      }
    }

    throw new Error('Unexpected response format from Claude')
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to process query with Claude')
  }
}