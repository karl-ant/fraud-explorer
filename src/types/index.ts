export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'canceled';
  original_status?: string; // Original status from payment processor
  processor?: 'stripe' | 'paypal'; // Payment processor
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
  processor?: 'stripe' | 'paypal' | 'all';
}

export interface FraudPattern {
  type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  affected_transactions: string[];
  recommendation: string;
}