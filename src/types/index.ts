export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'canceled';
  original_status?: string; // Original status from payment processor
  processor?: 'stripe' | 'paypal' | 'adyen'; // Payment processor
  created: number;
  customer?: string;
  description?: string;
  payment_method?: string;
  metadata?: Record<string, any>;
}

export interface QueryResponse {
  data: TransactionData[];
  summary?: string;
  error?: string;
  fraud_patterns?: FraudPattern[];
}

export interface QueryRequest {
  query: string;
  processor?: 'stripe' | 'paypal' | 'adyen' | 'all';
}

export interface FraudPattern {
  type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  affected_transactions: string[];
  recommendation: string;
}

export interface ClaudeFilters {
  status?: string[];
  processors?: string[];
  amount?: { min?: number; max?: number };
  currency?: string;
  country?: string;
  timeRange?: {
    relative?: string;
    start?: string;
    end?: string;
  };
  customer?: string;
  fraudIndicators?: string[];
}

export interface ClaudeQueryResponse {
  filters: ClaudeFilters;
  intent: string;
  explanation: string;
}

export interface TransactionFilters {
  status?: string;
  amount?: { gte?: number; lte?: number };
  created?: { gte?: number; lte?: number };
  currency?: string;
  country?: string;
  customer?: string;
  limit?: number;
}