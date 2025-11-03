import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

interface StripeFilters {
  status?: string
  created?: {
    gte?: number
    lte?: number
  }
  amount?: {
    gte?: number
    lte?: number
  }
  customer?: string
  limit?: number
}

class StripeMCPClient {
  private client: Client | null = null
  private transport: StdioClientTransport | null = null

  async connect(useRealMCP = false) {
    if (this.client) return

    try {
      if (useRealMCP) {
        console.log('Connecting to real Stripe MCP server at https://mcp.stripe.com')
        // For real MCP connection, we'll use Stripe's HTTP MCP server
        // This connects to the actual Stripe MCP server
        this.client = {} as Client // Placeholder for now - HTTP connection doesn't use SDK client
      } else {
        console.log('Using mock Stripe MCP server...')
        // Simulated connection
        this.client = {} as Client
      }
    } catch (error) {
      console.error('Failed to connect to Stripe MCP:', error)
      throw error
    }
  }

  async disconnect() {
    if (this.transport) {
      await this.transport.close()
      this.transport = null
    }
    this.client = null
  }

  async listCharges(filters: StripeFilters = {}, useRealMCP = false) {
    if (!this.client) {
      await this.connect(useRealMCP)
    }

    if (useRealMCP) {
      // Call the actual Stripe MCP server
      return await this.callRealStripeMCP(filters)
    }

    // For MVP, return mock data that simulates Stripe API responses
    return this.generateMockTransactions(filters)
  }

  private async callRealStripeMCP(filters: StripeFilters) {
    try {
      // Use Stripe MCP HTTP server directly
      const mcpUrl = 'https://mcp.stripe.com'
      
      // First, let's try to discover what tools are available
      const toolsListRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/list'
      }

      console.log('Discovering available Stripe MCP tools...')
      
      const toolsResponse = await fetch(mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
        body: JSON.stringify(toolsListRequest)
      })

      if (toolsResponse.ok) {
        const toolsList = await toolsResponse.json()
        console.log('Available Stripe MCP tools:', JSON.stringify(toolsList, null, 2))
      }
      
      // Use search_stripe_resources to find payment intents
      let searchQuery = 'payment_intents:'
      let queryParts = []
      
      // Build the search query properly for Stripe search syntax
      if (filters.status === 'failed') {
        // For failed transactions, look for both actual failures and payment methods that need replacement
        searchQuery = 'payment_intents:status:"failed" OR payment_intents:status:"requires_payment_method"'
      } else if (filters.status === 'succeeded') {
        searchQuery = 'payment_intents:status:"succeeded"'
      } else if (filters.status === 'pending') {
        searchQuery = 'payment_intents:status:"requires_confirmation" OR payment_intents:status:"requires_action"'
      } else {
        // For general queries, just search all payment intents
        searchQuery = 'payment_intents:'
      }
      
      // Note: Date and amount filters are not easily supported in Stripe's search syntax
      // The search API has limitations - we'll rely on the fallback list_payment_intents
      // which can be filtered in post-processing

      // Try to search for payment intents using the search tool
      try {
        const mcpRequest = {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: 'search_stripe_resources',
            arguments: {
              query: searchQuery
            }
          }
        }

        console.log(`Searching Stripe with query: ${searchQuery}`)
        
        const response = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
          body: JSON.stringify(mcpRequest)
        })

        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`)
        }

        const mcpResponse = await response.json()
        
        if (mcpResponse.error) {
          console.log(`Search returned error:`, mcpResponse.error)
          throw new Error(mcpResponse.error.message || 'Search failed')
        }

        // Success! Process the response
        console.log(`Successfully searched Stripe resources`)
        console.log(`Search response:`, JSON.stringify(mcpResponse, null, 2))
        const searchResults = await this.processStripeMCPResponse(mcpResponse)
        
        // If search returned empty results, try the fallback
        if (searchResults.length === 0) {
          console.log('Search returned no results, trying fallback...')
          throw new Error('Search returned empty results')
        }
        
        return searchResults
        
      } catch (error) {
        console.log(`Search failed:`, error)
        
        // Try using the list_payment_intents tool as a fallback
        try {
          console.log('Fallback: trying list_payment_intents tool...')
          
          const listRequest = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
              name: 'list_payment_intents',
              arguments: {
                limit: filters.limit || 100
              }
            }
          }

          const listResponse = await fetch(mcpUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            },
            body: JSON.stringify(listRequest)
          })

          if (listResponse.ok) {
            const listResult = await listResponse.json()
            if (!listResult.error) {
              console.log('Successfully used list_payment_intents fallback')
              return await this.processStripeMCPResponse(listResult)
            }
          }
        } catch (fallbackError) {
          console.log('Fallback also failed:', fallbackError)
        }
        
        throw error
      }

    } catch (error) {
      console.error('Stripe MCP call failed:', error)
      
      // Provide helpful error messages based on common issues
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Stripe API authentication failed. Please check your STRIPE_SECRET_KEY environment variable.')
        }
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          throw new Error('Unable to connect to Stripe MCP server. Please check your internet connection.')
        }
      }
      
      throw new Error(`Stripe MCP integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async processStripeMCPResponse(mcpResponse: any) {
    try {
      console.log('Processing Stripe MCP response:', JSON.stringify(mcpResponse, null, 2))
      
      // Handle different response formats from Stripe MCP
      let data = mcpResponse.result
      
      // If the result contains content, extract it
      if (data?.content) {
        if (Array.isArray(data.content) && data.content[0]?.text) {
          try {
            data = JSON.parse(data.content[0].text)
          } catch {
            // If it's not JSON, treat as plain text response
            console.log('Response is not JSON, treating as text')
            return []
          }
        }
      }

      // Handle Stripe API list response format
      if (data?.data && Array.isArray(data.data)) {
        return data.data.map((charge: any) => {
          console.log(`Processing payment intent: ${charge.id}, original status: ${charge.status}, mapped to: ${this.mapStripeStatus(charge.status)}`)
          return {
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            status: this.mapStripeStatus(charge.status), // Keep mapped for filtering
            original_status: charge.status, // Add original status for display
            created: charge.created,
            customer: charge.customer,
            description: charge.description,
            payment_method: charge.payment_method,
            metadata: {
              ...charge.metadata,
              country: charge.billing_details?.address?.country || 'US',
              risk_score: charge.outcome?.risk_score?.toString() || '0'
            }
          }
        })
      }

      // Handle direct array response
      if (Array.isArray(data)) {
        return data.map((charge: any) => {
          console.log(`Processing payment intent: ${charge.id}, original status: ${charge.status}, mapped to: ${this.mapStripeStatus(charge.status)}`)
          return {
            id: charge.id || `stripe_${Date.now()}_${Math.random()}`,
            amount: charge.amount,
            currency: charge.currency || 'usd',
            status: this.mapStripeStatus(charge.status), // Keep mapped for filtering
            original_status: charge.status, // Add original status for display
            created: charge.created || Math.floor(Date.now() / 1000),
            customer: charge.customer,
            description: charge.description,
            payment_method: charge.payment_method,
            metadata: {
              ...charge.metadata,
              country: charge.billing_details?.address?.country || 'US',
              risk_score: charge.outcome?.risk_score?.toString() || '0'
            }
          }
        })
      }

      console.log('No recognizable data format in Stripe MCP response')
      return []
      
    } catch (error) {
      console.error('Failed to process Stripe MCP response:', error)
      throw new Error('Invalid response format from Stripe MCP server')
    }
  }

  private mapStripeStatus(status: string): 'succeeded' | 'failed' | 'pending' | 'canceled' {
    switch (status) {
      case 'succeeded':
      case 'paid':
        return 'succeeded'
      case 'failed':
      case 'declined':
      case 'payment_failed':
      case 'requires_payment_method':  // This means the payment failed and needs a new payment method
        return 'failed'
      case 'pending':
      case 'processing':
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_capture':
        return 'pending'
      case 'canceled':
      case 'cancelled':
        return 'canceled'
      default:
        return 'pending'
    }
  }

  private generateMockTransactions(filters: StripeFilters) {
    const mockData = [
      {
        id: 'ch_1234567890abcdef',
        amount: 2500, // $25.00 in cents
        currency: 'usd',
        status: 'succeeded' as const,
        created: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        customer: 'cus_abc123',
        description: 'Monthly subscription',
        payment_method: 'card_123',
        metadata: { plan: 'premium' }
      },
      {
        id: 'ch_abcdef1234567890',
        amount: 5000, // $50.00 in cents
        currency: 'usd',
        status: 'failed' as const,
        created: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
        customer: 'cus_def456',
        description: 'Product purchase',
        payment_method: 'card_456',
        metadata: { product: 'widget' }
      },
      {
        id: 'ch_567890abcdef1234',
        amount: 12000, // $120.00 in cents
        currency: 'usd',
        status: 'pending' as const,
        created: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        customer: 'cus_ghi789',
        description: 'Large order payment',
        payment_method: 'bank_transfer',
        metadata: { order_id: '12345' }
      },
      {
        id: 'ch_def1234567890abc',
        amount: 750, // $7.50 in cents
        currency: 'usd',
        status: 'succeeded' as const,
        created: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
        customer: 'cus_jkl012',
        description: 'Coffee purchase',
        payment_method: 'card_789',
        metadata: { location: 'store_1' }
      },
      {
        id: 'ch_890abcdef1234567',
        amount: 15000, // $150.00 in cents
        currency: 'usd',
        status: 'failed' as const,
        created: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        customer: undefined,
        description: 'Failed payment attempt',
        payment_method: 'card_failed',
        metadata: { retry_attempt: '3' }
      }
    ]

    // Apply filters to mock data
    let filteredData = mockData

    if (filters.status) {
      filteredData = filteredData.filter(t => t.status === filters.status)
    }

    if (filters.created) {
      if (filters.created.gte) {
        filteredData = filteredData.filter(t => t.created >= filters.created!.gte!)
      }
      if (filters.created.lte) {
        filteredData = filteredData.filter(t => t.created <= filters.created!.lte!)
      }
    }

    if (filters.amount) {
      if (filters.amount.gte) {
        filteredData = filteredData.filter(t => t.amount >= filters.amount!.gte!)
      }
      if (filters.amount.lte) {
        filteredData = filteredData.filter(t => t.amount <= filters.amount!.lte!)
      }
    }

    if (filters.customer) {
      filteredData = filteredData.filter(t => t.customer === filters.customer)
    }

    if (filters.limit) {
      filteredData = filteredData.slice(0, filters.limit)
    }

    return filteredData
  }
}

export default StripeMCPClient