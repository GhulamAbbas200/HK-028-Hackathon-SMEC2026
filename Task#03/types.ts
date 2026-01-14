
export interface Expense {
  id: string;
  merchant: string;
  date: string;
  total: number;
  category: string;
  currency: string;
  imageUrl?: string;
  rawText?: string;
  createdAt: number;
}

export interface ScanResult {
  merchant: string;
  date: string;
  total: number;
  category: string;
  currency: string;
  confidence: number;
  rawText?: string;
}

export interface MonthlySummary {
  month: string;
  total: number;
  categoryBreakdown: Record<string, number>;
}

export interface Alert {
  id: string;
  type: 'BUDGET_EXCEEDED' | 'UNUSUAL_SPENDING' | 'CATEGORY_SPIKE';
  message: string;
  timestamp: number;
  isRead: boolean;
}

export enum Category {
  Food = 'Food & Dining',
  Shopping = 'Shopping',
  Travel = 'Travel & Transport',
  Utilities = 'Utilities',
  Health = 'Health',
  Entertainment = 'Entertainment',
  Other = 'Other'
}
